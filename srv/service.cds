using { com.client.dashboard as my } from '../db/schema';

service ClientDashboardService {
    @odata.draft.enabled
    entity Clients as projection on my.Clients;

    entity StatusValues as projection on my.StatusValues;

    @odata.draft.enabled
    entity ProjectMilestone as projection on my.ProjectMilestone {
        *,
        CriticalityCode,
        client : redirected to Clients,
        Status : redirected to StatusValues
    } actions {
        action submitForApproval();
    };

    // Callback endpoint for the workflow to report its outcome
    action updateApprovalStatus(milestoneId: UUID, status: String) returns String;
}

annotate ClientDashboardService.ProjectMilestone with {
    client @Common.ValueList : {
        CollectionPath : 'Clients',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : client_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'clientName'
            }
        ]
    };
}

annotate ClientDashboardService.ProjectMilestone with @(
    UI.DataProgress : #Progress,
    UI.DataPoint #Progress : {
        Value : CompletionPercentage,
        TargetValue : 100,
        Visualization : #Progress
    }
);