module.exports.workflow = {
  "labarchives": {
    "draft": {
      config: {
        workflow: {
          stage: 'draft',
          stageLabel: 'Draft',
        },
        authorization: {
          viewRoles: ['Admin', 'Librarians'],
          editRoles: ['Admin', 'Librarians']
        },
        form: 'labarchives-1.0-draft'
      },
      starting: true
    }
  }
}
