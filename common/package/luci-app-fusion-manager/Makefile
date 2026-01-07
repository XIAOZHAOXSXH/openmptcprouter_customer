include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-fusion-manager
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-fusion-manager
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=Fusion Gateway Guest Manager
  DEPENDS:=+luci-base +shadow-useradd +shadow-userdel +shadow-usermod
endef

define Package/luci-app-fusion-manager/description
  LuCI module to manage the Fusion Gateway guest account.
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/luci-app-fusion-manager/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci
	if [ -d ./luasrc ]; then \
		$(CP) ./luasrc/* $(1)/usr/lib/lua/luci/; \
	fi
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	if [ -d ./root/usr/share/rpcd/acl.d ]; then \
		$(CP) ./root/usr/share/rpcd/acl.d/* $(1)/usr/share/rpcd/acl.d/; \
	fi
	$(INSTALL_DIR) $(1)/etc/config
	if [ -d ./root/etc/config ]; then \
		$(CP) ./root/etc/config/* $(1)/etc/config/; \
	fi
endef

$(eval $(call BuildPackage,luci-app-fusion-manager))
