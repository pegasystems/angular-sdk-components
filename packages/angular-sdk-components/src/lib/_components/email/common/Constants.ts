/*
 * Copyright (c) 2023 Pegasystems Inc.
 * All rights reserved.
 * Please find more details under the LICENSE file in the root directory of this source tree.
 */
/*
 * This is used to store constaints that are used in components.
 */
export const IS_PRIMARY_CONTEXT = 'IS_PRIMARY_CONTEXT';
export const ARTICLE_LINK = 'ArticleLink';
export const BUDDY = 'Buddy';
export const BUDDY_CONTENT_PLACEHOLDER = '$$BUDDYCONTENT_PLACEHOLDER$$';
export const ARTICLE_LINK_PLACEHOLDER = '$$ARTICLELINK_PLACEHOLDER$$';
export const EMAIL_TRIAGE_SHARED_STORE = 'EmailTriageCaseList';
export const OPENED_INT_BY_OPERATOR = 'OpenInteactionByOp';
export const FORWARD_ACTION_IN_COMPOSER = 'FORWARD';
export const REPLYALL_ACTION_IN_COMPOSER = 'REPLYALL';
export const REPLY_ACTION_IN_COMPOSER = 'REPLY';
export const REPLIED_CONTENT = 'REPLIED_CONTENT';
export const REM_ALL_ADDITIONAL_CONTENT = 'REM_ALL_ADDITIONAL_CONTENT';
export const REPLIED_CONTENT_DIV = 'pega-email-message-reply';
export const FORWARDED_CONTENT_DIV = 'pega-email-message-forward';
export const PDF_TYPE = 'application/pdf';
export const BYTES_TO_MB = 1000000;

export const EMAIL_ACTIONS = {
  REPLY: 'reply',
  REPLY_ALL: 'replyAll',
  FORWARD: 'forward',
  DELETE: 'delete',
  EDIT: 'edit'
};
