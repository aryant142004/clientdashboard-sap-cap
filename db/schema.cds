namespace com.client.dashboard;

using { managed, cuid } from '@sap/cds/common';

entity Clients : cuid, managed {
    key ID       : UUID;
    clientName   : String(100);
    industry     : String(100);
    milestones   : Association to many ProjectMilestone on milestones.client = $self;
    contactEmail : String(100);
}
entity StatusValues{
    key code    : String;
    name        : String;
}
entity ProjectMilestone : cuid, managed {
    ProjectName          : String;
    MilestoneName        : String;
    Status               : Association to StatusValues;
    @Measures.Unit       : '%'
    @Core.IsSubscribed   : false
    CompletionPercentage : Integer;
    CriticalityCode      : Integer default 2;
    client               : Association to Clients; // Default to Orange/Warning if blank
    ApprovalStatus       : String default 'Not Submitted';
}