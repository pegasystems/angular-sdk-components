export const getCanPerformFromAssignments = (assignments, caseID) => {
  if (assignments && assignments.length > 0) {
    for (let assignIndex = 0; assignIndex < assignments.length; assignIndex++) {
      const assignment = assignments[assignIndex];
      if (assignment.ID && assignment.ID.includes(caseID)) {
        return assignment.canPerform === 'true';
      }
    }
  }
  return false;
};

export const updateImageSrcsWithAbsoluteURLs = (content, pConn) => {
  const newPath = pConn.getServerURL();
  const temporaryElement = document.createElement('div');
  temporaryElement.innerHTML = content;

  // Replace the `src` attributes
  Array.from(temporaryElement.querySelectorAll('img')).forEach(img => {
    const path = img.src;
    if (path.includes('datacontent/Image')) {
      const fileName = path.slice(path.lastIndexOf('datacontent/Image'));
      img.src = `${newPath}/${fileName}`;
    }
  });

  // Retrieve the updated `innerHTML` property
  return temporaryElement.innerHTML;
};
