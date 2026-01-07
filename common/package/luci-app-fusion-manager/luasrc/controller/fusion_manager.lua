module("luci.controller.fusion_manager", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/fusion-manager") then
		return
	end

	entry({"admin", "services", "fusion-manager"}, cbi("fusion_manager"), _("访客管理"), 90).dependent = true
end
