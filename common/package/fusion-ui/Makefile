include $(TOPDIR)/rules.mk

PKG_NAME:=fusion-ui
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/fusion-ui
  SECTION:=fusion
  CATEGORY:=Fusion Gateway
  TITLE:=Fusion Gateway Custom Web UI
  DEPENDS:=+rpcd +rpcd-mod-file +rpcd-mod-luci +uhttpd +uhttpd-mod-ubus
endef

define Package/fusion-ui/description
  A modern Single Page Application for the guest user of Fusion Gateway.
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/fusion-ui/install
	$(INSTALL_DIR) $(1)/www/fusion
	if [ -d ./files/www/fusion ]; then \
		$(CP) ./files/www/fusion/* $(1)/www/fusion/; \
	fi
endef

$(eval $(call BuildPackage,fusion-ui))
