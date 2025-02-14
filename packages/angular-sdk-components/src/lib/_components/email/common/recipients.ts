export default function getRecipient(recipient, fromChannel) {
  return {
    fullName: recipient.pyFromDisplayName === undefined ? '' : recipient.pyFromDisplayName,
    emailAddress: recipient.pyFrom,
    shortName: recipient.pyFromDisplayName,
    avatarProps: {
      icon: fromChannel === 'Email' ? '' : 'headset'
    }
  };
}

export const getRecipientList = (recipientDetails, fromChannel) => {
  if (recipientDetails === undefined || recipientDetails === null) {
    return [];
  }
  const recipientList: any = [];
  recipientDetails.forEach(recipient => {
    const recipientData = getRecipient(recipient, fromChannel);
    recipientList.push(recipientData);
  });
  return recipientList;
};
