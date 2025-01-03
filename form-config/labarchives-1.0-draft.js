/**
 * Template form
 */
module.exports.form = {
  forms: {
    'labarchives-1.0-draft': {
      name: 'labarchives-1.0-draft',
      type: 'labarchives',
      customAngularApp: {
        appName: 'labarchives',
        appSelector: 'labarchives-form'
      },
      skipValidationOnSave: true,
      editCssClasses: 'row col-md-12',
      viewCssClasses: 'row col-md-offset-1 col-md-10',
      messages: {
        'saving': ['@dmpt-form-saving'],
        'validationFail': ['@dmpt-form-validation-fail-prefix', '@dmpt-form-validation-fail-suffix'],
        'saveSuccess': ['@dmpt-form-save-success'],
        'saveError': ['@dmpt-form-save-error']
      },
      fields: [
        {
          class: 'Container',
          compClass: 'TextBlockComponent',
          viewOnly: false,
          definition: {
            name: 'title',
            value: 'eNotebooks',
            type: 'h2'
          }
        },
        {
          class: 'LabarchivesLoginField',
          viewOnly: false,
          definition: {
            name: 'Login',
            loginLabel: 'Login',
            userLoginError: 'Please include your UTS email address',
            usernameLabel: 'UTS email address',
            userPasswordError: 'Please include your password token',
            passwordLabel: 'LabArchives password token for external applications',
            helpLoginLabel: 'To get your LabArchives password token:',
            helpLoginLabelList: [
              'Log in to LabArchives',
              'In the top right, choose the user menu',
              'Select LA App authentication',
              'Copy the token from Use this password',
              'Come back to this screen',
              'Enter your UTS email address',
              'Paste the password token you copied above into LabArchives password token for external applications.'
            ],
            loginHelpImageAlt: 'labarchives help login',
            loginHelpImage: '/images/labarchives-help-login.png',
            closeLabel: 'Close'
          }
        },
        {
          class: 'LabarchivesListField',
          viewOnly: false,
          definition: {
            name: 'List',
            linkedLabel: 'Linked with Stash',
            defaultNotebookLabel: 'Default Notebook',
            createNotebookLabel: 'Create Notebook'
          }
        },
        {
          class: 'LabarchivesLinkField',
          viewOnly: false,
          definition: {
            name: 'Link',
            processingLabel: 'Processing...',
            processingSuccess: 'Your workspace was linked successfully',
            processingFail: 'There was a problem linking your workspace, please try again later',
            processingNoPermission: 'You do not have rights to modify this item',
            closeLabel: 'Close',
          }
        },
        {
          class: 'LabarchivesCreateField',
          viewOnly: false,
          definition: {
            name: 'Create',
            createButton: 'Create Notebook',
            supervisorFailMessage: 'FNCI/Supervisor has not logged in to LabArchives',
            createNotebookHelp: 'Creating a notebook with Stash will try to add your RDMP FNCI/Supervisor to your notebook. It will also then add information about your Data Management Plan on it',
            createNotebookHelp2: 'Give your notebook a name that is related to your research',
            notebookLabel: 'Notebook Name',
            supervisorLabel: 'RDMP FNCI/Supervisor',
            createNotebookLabel: 'Create Notebook',
            creatingLabel: 'Creating Notebook',
            linkingLabel: 'Linking Notebook',
            processingLabel: 'Processing...',
            processingSuccess: 'Your workspace was linked successfully',
            processingFail: 'There was a problem linking your workspace, please try again later',
            processingNoPermission: 'You do not have rights to modify this item',
            closeLabel: 'Close',
          }
        },
        {
          class: "AnchorOrButton",
          viewOnly: false,
          definition: {
            name: "BackToPlan",
            label: 'Back to your Plan',
            value: '/@branding/@portal/record/edit/',
            cssClasses: 'btn btn-large btn-info',
            showPencil: false,
            controlType: 'anchor'
          },
          variableSubstitutionFields: ['value']
        }
      ]
    }
  }
};
