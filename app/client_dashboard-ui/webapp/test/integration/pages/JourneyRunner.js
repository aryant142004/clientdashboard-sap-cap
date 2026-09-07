sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/client/dashboard/clientdashboardui/test/integration/pages/ProjectMilestoneList.gen",
	"com/client/dashboard/clientdashboardui/test/integration/pages/ProjectMilestoneObjectPage.gen"
], function (JourneyRunner, ProjectMilestoneListGenerated, ProjectMilestoneObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/client/dashboard/clientdashboardui') + '/test/flp.html#app-preview',
        pages: {
			onTheProjectMilestoneListGenerated: ProjectMilestoneListGenerated,
			onTheProjectMilestoneObjectPageGenerated: ProjectMilestoneObjectPageGenerated
        },
        async: true
    });

    return runner;
});

