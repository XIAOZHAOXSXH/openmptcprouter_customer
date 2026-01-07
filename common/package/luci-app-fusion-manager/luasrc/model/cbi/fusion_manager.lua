m = Map("fusion-manager", translate("访客管理"), translate("管理融合网关的访客访问权限。"))

s = m:section(TypedSection, "guest", translate("访客账号"))
s.anonymous = true
s.addremove = false

e = s:option(Flag, "enabled", translate("启用访客账号"))
e.rmempty = false

p = s:option(Value, "password", translate("密码"))
p.password = true
p.rmempty = false

function m.on_after_commit(self)
    local uci = require "luci.model.uci".cursor()
    local enabled = uci:get("fusion-manager", "settings", "enabled")
    local password = uci:get("fusion-manager", "settings", "password")
    
    if enabled == "1" then
        -- 1. Ensure system user exists
        local code = os.execute("id guest >/dev/null 2>&1")
        if code ~= 0 then
            os.execute("useradd -m -s /bin/ash guest")
        end
        
        -- 2. Set system password
        if password and #password > 0 then
            local cmd = string.format("echo 'guest:%s' | chpasswd", password)
            os.execute(cmd)
        end

        -- 3. Configure RPCD login mapping
        -- We need to check if a login config for guest exists, if not create it
        local rpcd_uci = require "luci.model.uci".cursor()
        local found = false
        rpcd_uci:foreach("rpcd", "login", function(s)
            if s.username == "guest" then
                found = true
                -- Ensure ACLs are correct
                local read_acls = s.read or {}
                local write_acls = s.write or {}
                local changed = false
                
                if type(read_acls) == "string" then read_acls = {read_acls} end
                if type(write_acls) == "string" then write_acls = {write_acls} end

                if not table.contains(read_acls, "guest") then
                    table.insert(read_acls, "guest")
                    rpcd_uci:set("rpcd", s[".name"], "read", read_acls)
                    changed = true
                end
                if not table.contains(write_acls, "guest") then
                    table.insert(write_acls, "guest")
                    rpcd_uci:set("rpcd", s[".name"], "write", write_acls)
                    changed = true
                end
                
                -- Update password field in rpcd config to match system (hashed)
                -- Actually rpcd usually uses shadow, so we just need username/group mapping
                -- If rpcd is configured to use shadow, we don't need 'password' option here usually,
                -- but if it uses explicit password, we'd need to copy the shadow hash.
                -- Standard OpenWrt rpcd uses shadow by default for authentication if no password is in uci.
                -- But we strictly need to ensure the group mapping exists.
            end
        end)

        if not found then
            local section = rpcd_uci:add("rpcd", "login")
            rpcd_uci:set("rpcd", section, "username", "guest")
            rpcd_uci:set("rpcd", section, "read", {"guest"})
            rpcd_uci:set("rpcd", section, "write", {"guest"})
            -- Note: We don't set password here, relying on shadow auth
        end
        rpcd_uci:commit("rpcd")
        
        -- Reload rpcd to apply changes
        os.execute("/etc/init.d/rpcd reload")

    else
        -- Disable: remove user and rpcd config
        os.execute("userdel -r guest >/dev/null 2>&1")
        
        local rpcd_uci = require "luci.model.uci".cursor()
        rpcd_uci:foreach("rpcd", "login", function(s)
            if s.username == "guest" then
                rpcd_uci:delete("rpcd", s[".name"])
            end
        end)
        rpcd_uci:commit("rpcd")
        os.execute("/etc/init.d/rpcd reload")
    end
end

-- Helper function
function table.contains(table, element)
  for _, value in pairs(table) do
    if value == element then
      return true
    end
  end
  return false
end

return m
