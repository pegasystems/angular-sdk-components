// Actions published by a data object record under the `dataInfo` context. Work cases
// publish their actions under `caseInfo` instead; the case view renders both together.

export interface DataObjectAction {
  ID: string;
  name: string;
}

export interface CreateCaseActionInput {
  linkedField: string;
}

export interface CreateCaseAction {
  ID: string;
  name: string;
  targetDataReferenceField?: {
    // Property on the new case that the record is linked into; inputs are nested under it.
    field?: string;
    inputs?: CreateCaseActionInput[];
  };
}

export interface DataObjectActions {
  availableActions?: DataObjectAction[];
  availableCreateCaseActions?: CreateCaseAction[];
}
