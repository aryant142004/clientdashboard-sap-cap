using { ClientDashboardService } from '../../srv/service';

annotate ClientDashboardService.ProjectMilestone with @(
    UI.LineItem : [
        { $Type : 'UI.DataFieldForAction', Action : 'ClientDashboardService.submitForApproval', Label : 'Submit for Approval' },
        { $Type : 'UI.DataField', Label : 'Client Name', Value : client.clientName },
        { 
            $Type : 'UI.DataField', 
            Label : 'Milestone Name', 
            Value : MilestoneName,
            ![@UI.Importance] : #High 
        },
        { $Type : 'UI.DataField', Label : 'Status', Value : Status_code },
        { 
            $Type : 'UI.DataFieldForAnnotation', 
            Label : 'Progress', 
            Target : '@UI.DataPoint#Progress' 
        }
    ],
    // This explicitly maps the navigation click target so rows open properly and includes the button on the object page
    UI.Identification : [
        { $Type : 'UI.DataFieldForAction', Action : 'ClientDashboardService.submitForApproval', Label : 'Submit for Approval' },
        {
            $Type : 'UI.DataFieldForIntentBasedNavigation',
            Label : 'Milestone Name',
            Value : MilestoneName
        }
    ],
    UI.HeaderInfo : {
        TypeName : 'Project Milestone',
        TypeNamePlural : 'Project Milestones',
        Title : { Value : MilestoneName }
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'StandardFacet',
            Label : 'Milestone Information',
            Target : '@UI.FieldGroup#Standard'
        }
    ],
    UI.FieldGroup #Standard : {
        Data : [
            { $Type : 'UI.DataField', Value : client_ID, Label : 'Client' },
            { $Type : 'UI.DataField', Value : MilestoneName, Label : 'Milestone Name' },
            { $Type : 'UI.DataField', Value : Status_code, Label : 'Status' },
            { $Type : 'UI.DataField', Value : CompletionPercentage, Label : 'Completion Percentage' },
            { $Type : 'UI.DataField', Value : CriticalityCode, Label : 'Criticality Code' }
        ]
    }
);

// This defines the progress bar visualization and maps the criticality colors
annotate ClientDashboardService.ProjectMilestone with @(
    UI.DataPoint #Progress : {
        Value : CompletionPercentage,
        TargetValue : 100,
        Criticality : CriticalityCode,
        Visualization : #Progress
    }
);

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
};