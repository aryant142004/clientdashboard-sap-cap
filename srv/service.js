const cds = require('@sap/cds');
const axios = require('axios');
const { execSync } = require('child_process');

module.exports = cds.service.impl(async function () {
    const { ProjectMilestone } = this.entities;

    const setCriticality = (item) => {
        if (!item) return;
        const status = item.Status_code ? item.Status_code.toString().toLowerCase().trim() : '';
        const percentage = Number(item.CompletionPercentage) || 0;

        if (status === 'completed' || percentage === 100) {
            item.CriticalityCode = 3; // Green
        } else if (status === 'in progress' || status === 'in_progress') {
            item.CriticalityCode = 2; // Orange
        } else if (status === 'not started' || status === 'not_started' || status === '') {
            item.CriticalityCode = 1; // Grey/Neutral
        } else if (status === 'delayed' || status === 'critical') {
            item.CriticalityCode = 0; // Red
        } else {
            item.CriticalityCode = 1; // fallback default
        }
    };

    this.after('READ', [ProjectMilestone, ProjectMilestone.drafts], (results) => {
        if (Array.isArray(results)) {
            results.forEach(setCriticality);
        } else if (results) {
            setCriticality(results);
        }
    });

    this.before(['CREATE', 'UPDATE'], [ProjectMilestone, ProjectMilestone.drafts], (req) => {
        setCriticality(req.data);
    });

    const handleSubmitForApproval = async (req) => {
        console.log('>>> submitForApproval handler triggered. req.params:', JSON.stringify(req.params));

        const ID = req.params[0]?.ID || req.data?.ID;

        let milestone = await SELECT.one.from(ProjectMilestone).where({ ID });
        if (!milestone) {
            milestone = await SELECT.one.from(ProjectMilestone.drafts).where({ ID });
        }

        if (!milestone) return req.error(404, "Milestone not found");

        try {
            const serviceKeyOutput = execSync(
                'cf service-key Enterprise_Invoice_Approval_Workflow Enterprise_Invoice_Approval_Workflow-key'
            ).toString();

            const jsonStart = serviceKeyOutput.indexOf('{');
            const creds = JSON.parse(serviceKeyOutput.slice(jsonStart)).credentials;

            const tokenResponse = await axios.post(
                `${creds.uaa.url}/oauth/token`,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: creds.uaa.clientid,
                    client_secret: creds.uaa.clientsecret
                }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const accessToken = tokenResponse.data.access_token;

            const response = await axios.post(
                `${creds.endpoints.api}/public/workflow/rest/v1/workflow-instances`,
                {
                    definitionId: "ap21.ff78f0dbtrial.milestoneapprovalworkflow.milestoneApprovalProcess",
                    context: {
                        milestoneid: milestone.ID,
                        milestoneName: milestone.MilestoneName,
                        completionPercentage: milestone.CompletionPercentage
                    }
                },
                { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
            );

            console.log(`Workflow triggered successfully for milestone: ${milestone.MilestoneName}, Instance ID: ${response.data.id}`);
            return req.info(200, `Approval workflow successfully triggered for "${milestone.MilestoneName}"!`);

        } catch (error) {
            console.error("Error triggering workflow:", error.response?.data || error.message);
            return req.error(500, `Failed to trigger the approval workflow: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleUpdateApprovalStatus = async (req) => {
        const { milestoneId, status } = req.data;
        console.log(`>>> updateApprovalStatus called for milestone ${milestoneId} with status: ${status}`);

        const milestone = await SELECT.one.from(ProjectMilestone).where({ ID: milestoneId });
        if (!milestone) return req.error(404, "Milestone not found for callback");

        await UPDATE(ProjectMilestone).set({ ApprovalStatus: status }).where({ ID: milestoneId });

        return `Approval status updated to ${status}`;
    };

    this.on('submitForApproval', 'ProjectMilestone', handleSubmitForApproval);
    this.on('updateApprovalStatus', handleUpdateApprovalStatus);
});