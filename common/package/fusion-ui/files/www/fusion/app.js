const { createApp, ref, reactive, onMounted, onUnmounted } = Vue;

createApp({
    setup() {
        const isLoggedIn = ref(false);
        const loading = ref(false);
        const errorMsg = ref('');
        const session = reactive({
            id: localStorage.getItem('fusion_session_id') || '',
            username: localStorage.getItem('fusion_username') || ''
        });
        const loginForm = reactive({
            username: '',
            password: ''
        });
        const currentView = ref('dashboard');
        
        const systemInfo = reactive({
            uptime: '-',
            load: '-',
            memory: '-'
        });

        const interfaces = ref({});
        const portForwards = ref([]);
        const newForward = reactive({
            name: '',
            src: 'wan',
            dest: 'lan',
            src_port: '',
            dest_ip: '',
            dest_port: '',
            proto: 'tcp'
        });

        const rpc = async (method, params = {}) => {
            const id = Math.floor(Math.random() * 10000);
            const parts = method.split('.');
            const obj = parts.slice(0, -1).join('.');
            const func = parts[parts.length - 1];
            
            const payload = {
                jsonrpc: "2.0",
                id: id,
                method: "call",
                params: [
                    session.id || "00000000000000000000000000000000",
                    obj,
                    func,
                    params
                ]
            };

            try {
                const response = await axios.post('/ubus', payload);
                if (response.data.error) {
                    if (response.data.error.code === -32002 || response.data.error.message === "Access denied") {
                        if (isLoggedIn.value) logout();
                        throw new Error('登录已过期或权限不足');
                    }
                    throw new Error('RPC Error: ' + (response.data.error.message || JSON.stringify(response.data.error)));
                }
                const res = response.data.result;
                if (res && res[0] !== 0) {
                    throw new Error('Ubus Error Code: ' + res[0]);
                }
                return res[1];
            } catch (e) {
                console.error("RPC Request Failed:", method, e);
                throw e;
            }
        };

        const login = async () => {
            loading.value = true;
            errorMsg.value = '';
            try {
                const res = await rpc('session.login', { 
                    username: loginForm.username, 
                    password: loginForm.password 
                });
                
                if (res && res.ubus_rpc_session) {
                    session.id = res.ubus_rpc_session;
                    session.username = loginForm.username;
                    localStorage.setItem('fusion_session_id', session.id);
                    localStorage.setItem('fusion_username', session.username);
                    isLoggedIn.value = true;
                    startPolling();
                } else {
                    errorMsg.value = '登录失败，请检查账号密码';
                }
            } catch (e) {
                errorMsg.value = e.message || '连接服务器失败';
            } finally {
                loading.value = false;
            }
        };

        const logout = () => {
            if (session.id) {
                rpc('session.destroy').catch(() => {});
            }
            session.id = '';
            session.username = '';
            localStorage.removeItem('fusion_session_id');
            localStorage.removeItem('fusion_username');
            isLoggedIn.value = false;
            stopPolling();
        };

        const fetchData = async () => {
            try {
                const info = await rpc('system.info');
                if (info) {
                    const seconds = info.uptime;
                    const d = Math.floor(seconds / (3600*24));
                    const h = Math.floor(seconds % (3600*24) / 3600);
                    const m = Math.floor(seconds % 3600 / 60);
                    systemInfo.uptime = `${d}天 ${h}小时 ${m}分`;
                    systemInfo.load = info.load.map(l => (l / 65535).toFixed(2)).join(', ');
                    systemInfo.memory = `${Math.round((info.memory.total - info.memory.free) / 1024 / 1024)}MB / ${Math.round(info.memory.total / 1024 / 1024)}MB`;
                }

                const net = await rpc('network.interface.dump');
                if (net && net.interface) {
                    const ifaces = {};
                    net.interface.forEach(i => {
                        if (i.interface !== 'loopback') {
                            ifaces[i.interface] = {
                                up: i.up,
                                ipaddr: i['ipv4-address'] && i['ipv4-address'].length ? i['ipv4-address'][0].address : '无',
                                macaddr: i.device || '-'
                            };
                        }
                    });
                    interfaces.value = ifaces;
                }

                if (currentView.value === 'firewall') {
                    const fw = await rpc('uci.get', { config: "firewall" });
                    if (fw && fw.values) {
                        portForwards.value = Object.values(fw.values).filter(v => v['.type'] === 'redirect');
                    }
                }
            } catch (e) {
                console.warn("数据同步失败", e);
            }
        };

        const addForward = async () => {
            try {
                await rpc('uci.add', { 
                    config: "firewall", 
                    type: "redirect",
                    values: {
                        name: newForward.name,
                        src: newForward.src,
                        target: "DNAT",
                        dest: newForward.dest,
                        proto: newForward.proto,
                        src_dport: newForward.src_port,
                        dest_ip: newForward.dest_ip,
                        dest_port: newForward.dest_port
                    }
                });
                await rpc('uci.commit', { config: "firewall" });
                alert('添加成功，防火墙已应用');
                fetchData();
            } catch(e) {
                alert('添加失败: ' + e.message);
            }
        };

        const reboot = async () => {
            if(confirm('确定要重启系统吗？')) {
                try {
                    await rpc('system.reboot');
                    alert('系统正在重启...');
                } catch(e) {
                    alert('操作失败: ' + e.message);
                }
            }
        };

        const shutdown = async () => {
            if(confirm('确定要关闭系统吗？')) {
                try {
                    await rpc('file.exec', { command: "/sbin/poweroff" });
                    alert('系统正在关机...');
                } catch(e) {
                    alert('操作失败: ' + e.message);
                }
            }
        };

        const sysupgrade = () => {
            alert('请上传固件包进行升级。由于安全限制，请在 Root 界面执行完整升级操作。');
        };

        const backup = () => {
            window.location.href = '/cgi-bin/luci/admin/system/backup/config';
        };

        let pollTimer;
        const startPolling = () => {
            fetchData();
            pollTimer = setInterval(fetchData, 5000);
        };
        const stopPolling = () => {
            if (pollTimer) clearInterval(pollTimer);
        };

        onMounted(() => {
            if (session.id) {
                rpc('session.list').then(() => {
                    isLoggedIn.value = true;
                    startPolling();
                }).catch(() => {
                    logout();
                });
            }
        });

        onUnmounted(() => {
            stopPolling();
        });

        return {
            isLoggedIn,
            loading,
            errorMsg,
            session,
            loginForm,
            login,
            logout,
            currentView,
            systemInfo,
            interfaces,
            portForwards,
            newForward,
            addForward,
            reboot,
            shutdown,
            sysupgrade,
            backup
        };
    }
}).mount('#app');
