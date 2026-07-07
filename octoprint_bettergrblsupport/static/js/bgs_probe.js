$(function () {
    function BgsProbeViewModel(parameters) {
        var self = this;

        self.loginState = parameters[0];
        self.access = parameters[1];
        self.settings = parameters[2];
        self.mainViewModel = parameters[3];

        self.probeDepth = ko.observable("10");
        self.probeFeedrate = ko.observable("20");
        self.touchPlateThickness = ko.observable("12");
        self.retractionDistance = ko.observable("2");

        self.is_printing = ko.computed(function () {
            return self.mainViewModel.is_printing();
        });
        self.is_operational = ko.computed(function () {
            return self.mainViewModel.is_operational();
        });
        self.state = ko.computed(function () {
            return self.mainViewModel.state();
        });
        self.probeStatus = ko.observable("");

        self.handleFocus = function (event) {
            window.setTimeout(function () {
                event.target.select();
            }, 0);
        };

        self._getSetting = function (settingName, fallbackValue) {
            var pluginSettings = self.settings && self.settings.settings && self.settings.settings.plugins && self.settings.settings.plugins.bettergrblsupport;
            if (pluginSettings && pluginSettings[settingName] && typeof pluginSettings[settingName] === "function") {
                var value = pluginSettings[settingName]();
                return value !== undefined && value !== null ? value : fallbackValue;
            }
            return fallbackValue;
        };

        self._setSetting = function (settingName, value) {
            var pluginSettings = self.settings.settings.plugins.bettergrblsupport;
            if (pluginSettings && pluginSettings[settingName] && typeof pluginSettings[settingName] === "function") {
                pluginSettings[settingName](value);
                self.settings.saveData();
            }
        };

        self.onBeforeBinding = function () {
            self.probeDepth(self._getSetting("probe_depth", "10"));
            self.probeFeedrate(self._getSetting("probe_feedrate", "20"));
            self.touchPlateThickness(self._getSetting("touch_plate_thickness", "12"));
            self.retractionDistance(self._getSetting("retraction_distance", "2"));

            self.probeDepth.subscribe(function (newValue) {
                self._setSetting("probe_depth", newValue);
            });

            self.probeFeedrate.subscribe(function (newValue) {
                self._setSetting("probe_feedrate", newValue);
            });

            self.touchPlateThickness.subscribe(function (newValue) {
                self._setSetting("touch_plate_thickness", newValue);
            });

            self.retractionDistance.subscribe(function (newValue) {
                self._setSetting("retraction_distance", newValue);
            });
        };

        self.doProbe = function () {
            self.probeStatus("");

            $.ajax({
                url: API_BASEURL + "plugin/bettergrblsupport",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "probe",
                    depth: self.probeDepth(),
                    feedrate: self.probeFeedrate(),
                    thickness: self.touchPlateThickness(),
                    retraction: self.retractionDistance()
                }),
                contentType: "application/json; charset=UTF-8",
                success: function (data) {
                    if (data && data.res) {
                        self.probeStatus(data.res);
                    }
                },
                error: function (data, status) {
                    var error = JSON.parse(data.responseText).error;
                    if (error == undefined) error = data.responseText;
                    self.probeStatus(error);

                    new PNotify({
                        title: "Probe failed!",
                        text: error,
                        hide: true,
                        buttons: {
                            sticker: false,
                            closer: true
                        },
                        type: "error"
                    });
                }
            });
        };

        self.onDataUpdaterPluginMessage = function (plugin, data) {
            if (plugin == "bettergrblsupport" && data.type == "grbl_state") {
                // state is sourced from the main Better Grbl Support viewmodel
            }

            if (plugin == "bettergrblsupport" && data.type == "touch_plate_zprobe") {
                if (data.gcode != undefined) {
                    OctoPrint.control.sendGcode(data.gcode);
                }
            }

            if (plugin == "bettergrblsupport" && data.type == "probe_result") {
                if (data.status == "success") {
                    self.probeStatus("Probe complete -- Z zeroed");
                } else if (data.status == "failure") {
                    self.probeStatus("Probe failed -- plate not triggered");
                    new PNotify({
                        title: "Probe failed",
                        text: "Probe failed -- plate not triggered",
                        hide: true,
                        buttons: {
                            sticker: false,
                            closer: true
                        },
                        type: "error"
                    });
                }
            }
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: BgsProbeViewModel,
        dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel", "betterGrblSupportViewModel"],
        elements: ["#probe_panel"]
    });
});
