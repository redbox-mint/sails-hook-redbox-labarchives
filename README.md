## A Sails Hook Redbox LabArchives


This Project is divided between folders

## api

Main API of your Hook can be stored in controllers and services

- controllers
- services
  
## config & form-config

This configurations are redbox-portal dependent. They will allow redbox to be available as a record
If you require to have a form in your portal

- `config/recordtype`
- `config/workflow`
- `form-config/labarchives-1.0-draft`

## index

Main entry point for the hook

### initialize

Init code before it gets hooked. 

### routes

Controller routes exposed to the sails front-end

```javascript
'get /your/route' : YourController.method
```

### configure

Add configuration and services to your sails app

```javascript
sails.services['YourService'] = function() { };
sails.config = _.merge(sails.config, {object});
```

## test

First run `npm install`

Test your sails hook with mocha by running `npm test` before adding the hook to your redbox-portal. 
It may cause your application to not lift.    

```sh
$ npm test

> @uts-eresearch/sails-hook-redbox-labarchives@1.0.0 test /Users/moises/source/code.research/sails-hook-redbox-labarchives
> NODE_ENV=test node_modules/.bin/mocha



  Basic tests ::
    ✓ should have a service
    ✓ should have a form
    ✓ should have a route
    ✓ sails does not crash


  4 passing (864ms)

```

For more information on testing your hook go to : https://sailsjs.com/documentation/concepts/testing


## Development in redbox-portal

There are several ways to code against the redbox-portal. One of it is to link the code via `npm link`

*npm link this hook*

```bash
cd /into/where/hook/is/
npm link
```

npm link into redbox-portal

```bash
cd /into/redbox-portal/
npm link sails-hook-redbox-labarchives
```

## Vagrant/Docker

Using docker while running redbox-portal is a posibility

In the `docker-compose.yml` file in redbox-portal verify that the service has the volume. 

```yml
       - "/opt/hooks:/opt/hooks"
```

For Vagrant to place the code inside of the same machine/docker. You can share it via the VagrantFile using sync_folder

```yml
  config.vm.synced_folder "/Users/moises/source/qcif/sails-hook-redbox-labarchives", "/opt/hooks/sails-hook-redbox-labarchives", id: "labarchives"
```

Now inside the docker instance of redbox-portal link the hook and your redbox-portal

```bash
docker exec -it redbox-portal_redboxportal_1 /bin/bash
```

run npm link in the hook folder

```bash
cd /opt/hooks/sails-hook-redbox-labarchives
npm link

```

now link this alias in your redbox-portal

```bash
cd /opt/redbox-portal
npm link sails-hook-redbox-labarchives
```

