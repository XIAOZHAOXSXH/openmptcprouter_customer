# Fusion Gateway (BPI-R4) 编译指南

本项目已进行深度定制，支持本地编译和 GitHub Actions 云编译。

## 方案 A：使用 GitHub Actions 云编译 (推荐)

本项目已配置 CI/CD 流程，无需配置本地环境即可编译。

1.  **Fork 本仓库** 到您的 GitHub 账号。
2.  进入 Actions 页面，点击左侧的 **Build Fusion Gateway**。
3.  点击 **Run workflow** 按钮。
    -   分支选择：`feature/fusion-gateway` (或您提交的分支)
4.  等待编译完成（通常需要 2-4 小时）。
5.  在 Action 运行结果页面底部的 **Artifacts** 区域下载固件压缩包。

## 方案 B：本地环境编译

**注意**：OpenWrt 必须在 Linux 环境下编译（如 Ubuntu 20.04/22.04 LTS 或 WSL2）。

### 1. 安装依赖 (以 Ubuntu 为例)
```bash
sudo apt update
sudo apt install -y build-essential ccache ecj fastjar file g++ gawk \
gettext git java-propose-classpath libelf-dev libncurses5-dev \
libncursesw5-dev libssl-dev python2 python2.7-dev python3 unzip wget \
python3-distutils python3-setuptools python3-dev rsync subversion \
swig time xsltproc zlib1g-dev
```

### 2. 开始编译

在源码根目录下执行以下命令：

```bash
# 设置目标平台为 BPI-R4 (内核 6.1) 并开始构建
export OMR_TARGET="bpi-r4"
export OMR_KERNEL="6.1"
./build.sh
```

### 常用参数说明
- `OMR_TARGET="bpi-r4"`: 指定目标硬件平台。
- `OMR_KERNEL="6.1"`: 指定内核版本（BPI-R4 建议使用 6.1 或 6.6）。
- `OMR_LOG="yes"`: 启用构建日志（推荐排错时使用）。
- `OMR_KEEPBIN="yes"`: 保留构建产物目录。

### 3. 获取固件

编译完成后，生成的固件镜像将位于：
`bpi-r4/6.1/source/bin/targets/mediatek/filogic/`

## 功能验证

刷入固件后：
1. **Root 登录**: 访问 `http://192.168.100.1` (默认 OpenWrt IP)，使用默认账号登录。
2. **启用访客**: 进入 `服务 -> 访客管理`，勾选启用并设置密码。
3. **访客登录**: 访问 `http://192.168.100.1/fusion/`，使用账号 `guest` 和您设置的密码登录。
