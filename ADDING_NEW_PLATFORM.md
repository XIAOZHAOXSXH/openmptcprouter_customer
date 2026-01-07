# 为不支持的平台创建 OpenMPTCProuter 镜像指南

本指南基于官方 Wiki 整理，旨在指导开发者如何在不受官方直接支持的平台上构建 OpenMPTCProuter 镜像。

## 1. 准备工作

### 环境要求
- 操作系统：Linux (推荐使用 Debian 10 或更高版本)。
- 权限：需要非 root 用户进行编译，但安装依赖时需要 root 权限。
- 工具安装 (Debian 10 示例):
  ```bash
  apt-get install busybox curl rsync build-essential asciidoc binutils bzip2 gawk gettext git libncurses5-dev libz-dev patch unzip zlib1g-dev lib32gcc1 libc6-dev-i386 subversion flex uglifyjs git-core gcc-multilib p7zip p7zip-full msmtp libssl-dev texinfo libglib2.0-dev xmlto qemu-utils upx libelf-dev autoconf automake libtool autopoint device-tree-compiler wget tar file llvm clang
  ```

### 获取源码
```bash
git clone https://github.com/Ysurac/openmptcprouter.git
cd openmptcprouter
```

## 2. 构建流程

### 方案 A：快速初始化 (如果平台已在 OpenWrt 中支持)
如果你想尝试为一个 OpenWrt 已支持但 OpenMPTCProuter 尚未预设配置的平台构建：

1. **确定平台名称**：查找 OpenWrt 中的 Target 名称。
2. **运行构建脚本进行预处理**：
   ```bash
   # OMR_TARGET 为你的平台名，OMR_KERNEL 推荐使用 6.1
   OMR_TARGET="myplatform" OMR_FEED_SRC="master" OMR_KERNEL="6.1" ./build.sh
   ```
   *注意：如果脚本提示 "Target not found"，它仍会继续下载源码到 `myplatform/6.1/source`。*

3. **手动配置与编译**：
   ```bash
   cd myplatform/6.1/source
   make menuconfig # 在菜单中选择你的硬件架构和插件
   make -j$(nproc)
   ```

### 方案 B：持久化新平台支持
如果你希望将该平台添加到 `build.sh` 的支持列表中：

1. **创建配置文件**：
   在根目录下创建一个名为 `config-myplatform` 的文件。可以参考 `config-x86_64` 的内容：
   ```bash
   CONFIG_TARGET_架构=y
   CONFIG_TARGET_子架构=y
   CONFIG_TARGET_具体设备=y
   CONFIG_KERNEL_TCP_CONG_BBR2=y # OpenMPTCProuter 的核心需求
   ```

2. **修改 `build.sh` (可选)**：
   在 `build.sh` 中找到 `OMR_REAL_TARGET` 的定义部分，为你的平台分配正确的 OpenWrt 架构名称，以便脚本能正确处理二进制文件。

## 3. 产物位置
编译完成后，镜像文件位于：
`myplatform/6.1/source/bin`

## 4. 注意事项
- **内核版本**：OpenMPTCProuter 对内核有特殊补丁要求（如 MPTCP, BBR2），建议优先使用脚本中指定的内核版本。
- **MPTCP 支持**：确保在 `make menuconfig` 中启用了 MPTCP 相关的内核模块和网络组件。
- **无担保声明**：为不支持的平台编译可能无法正常工作，需要一定的调试能力。
