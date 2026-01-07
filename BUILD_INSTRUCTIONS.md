# Fusion Gateway (BPI-R4) 编译指南

本项目已进行深度定制，以下是针对 BPI-R4 平台的编译步骤。

## 1. 准备编译环境

**注意**：OpenWrt 必须在 Linux 环境下编译（如 Ubuntu 20.04/22.04 LTS 或 WSL2）。

### 安装依赖 (以 Ubuntu 为例)
```bash
sudo apt update
sudo apt install -y build-essential ccache ecj fastjar file g++ gawk \
gettext git java-propose-classpath libelf-dev libncurses5-dev \
libncursesw5-dev libssl-dev python2 python2.7-dev python3 unzip wget \
python3-distutils python3-setuptools python3-dev rsync subversion \
swig time xsltproc zlib1g-dev
```

## 2. 开始编译

在源码根目录下执行以下命令：

```bash
# 设置目标平台为 BPI-R4 并开始构建
export OMR_TARGET="bpi-r4"
./build.sh
```

### 常用参数说明
- `OMR_TARGET="bpi-r4"`: 指定目标硬件平台。
- `OMR_LOG="yes"`: 启用构建日志（推荐排错时使用）。
- `OMR_KEEPBIN="yes"`: 保留构建产物目录。

## 3. 获取固件

编译完成后，生成的固件镜像将位于：
`bpi-r4/5.4/source/bin/targets/mediatek/filogic/` (内核版本号 `5.4` 可能会根据配置有所不同，请以实际生成的目录为准)。

## 4. 功能验证

刷入固件后：
1. **Root 登录**: 访问 `http://192.168.100.1` (默认 OpenWrt IP)，使用默认账号登录。
2. **启用访客**: 进入 `服务 -> 访客管理`，勾选启用并设置密码。
3. **访客登录**: 访问 `http://192.168.100.1/fusion/`，使用账号 `guest` 和您设置的密码登录。
