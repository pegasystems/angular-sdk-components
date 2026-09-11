import { Injectable } from '@angular/core';

export interface InstructionObject {
  htmlContent?: string;
  messageType?: string;
  dismissBanner?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateUtils {
  /**
   * Determine if the current view is the view of the case step/assignment.
   * @param {Function} pConnect PConnect object for the component
   */
  getIsAssignmentView(pConnect) {
    // Get caseInfo content from the store which contains the view info about the current assignment/step
    // TODO To be replaced with pConnect.getCaseInfo().getCurrentAssignmentView when it's available
    const assignmentViewClass = pConnect.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_CLASSID);
    const assignmentViewName = pConnect.getValue(PCore.getConstants().CASE_INFO.ASSIGNMENTACTION_ID);

    const assignmentViewId = `${assignmentViewName}!${assignmentViewClass}`;

    // Get the info about the current view from pConnect
    const currentViewId = `${pConnect.getCurrentView()}!${pConnect.getCurrentClassID()}`;

    return assignmentViewId === currentViewId;
  }

  /**
   * A hook that gets the instructions content for a view.
   * @param {Function} pConnect PConnect object for the component
   * @param {string} [instructions="casestep"] 'casestep', 'none', or the html content of a Rule-UI-Paragraph rule (processed via core's paragraph annotation handler)
   */
  getInstructions(pConnect, instructions: string | InstructionObject | null | undefined = 'casestep'): string | undefined {
    const caseStepInstructions = PCore.getConstants().CASE_INFO.INSTRUCTIONS && pConnect.getValue(PCore.getConstants().CASE_INFO.INSTRUCTIONS);

    // Determine if this view is the current assignment/step view
    const isCurrentAssignmentView = this.getIsAssignmentView(pConnect);

    // Case step instructions
    if (instructions === 'casestep' && isCurrentAssignmentView && caseStepInstructions?.length) {
      return caseStepInstructions;
    }

    // No instructions
    if (instructions === 'none') {
      return undefined;
    }

    // Paragraph annotation processing returns the resolved HTML in an object.
    if (this.isInstructionObject(instructions)) {
      return typeof instructions.htmlContent === 'string' ? instructions.htmlContent : undefined;
    }

    if (instructions == null) {
      return undefined;
    }

    // If the annotation wasn't processed correctly, don't return any instruction text
    if (instructions?.startsWith('@PARAGRAPH')) {
      return undefined;
    }

    // Custom instructions from the view
    // The raw metadata for `instructions` will be something like '@PARAGRAPH .SomeParagraphRule' but
    // it is evaluated by core logic to the content
    if (instructions !== 'casestep' && instructions !== 'none') {
      return this.addExternalLinkTarget(instructions);
    }
    return undefined;
  }

  getInstructionsType(instructions: string | InstructionObject | null | undefined): string | undefined {
    if (this.isInstructionObject(instructions) && typeof instructions.messageType === 'string') {
      return instructions.messageType;
    }
    return undefined;
  }

  getDismissBanner(instructions: string | InstructionObject | null | undefined): boolean {
    return this.isInstructionObject(instructions) && instructions.dismissBanner === true;
  }

  mapInstructionsTypeToBannerVariant(instructionsType: string): 'warning' | 'info' | 'success' {
    switch (instructionsType) {
      case 'Caution':
        return 'warning';
      case 'Good':
        return 'success';
      case 'Information':
      default:
        return 'info';
    }
  }

  private isInstructionObject(instructions: unknown): instructions is InstructionObject {
    return typeof instructions === 'object' && instructions !== null;
  }

  private addExternalLinkTarget(instructions: string): string {
    if (!instructions.includes('<a')) {
      return instructions;
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(instructions, 'text/html');
    const anchorNode = htmlDoc.querySelector('a');

    if (!anchorNode) {
      return instructions;
    }

    try {
      const url = new URL(anchorNode.href);
      if (url.origin !== window.location.origin) {
        anchorNode.setAttribute('target', '_blank');
        anchorNode.setAttribute('rel', 'noopener');
        return htmlDoc.body.innerHTML;
      }
    } catch (error) {
      console.error(error);
    }

    return instructions;
  }
}
