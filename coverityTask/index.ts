import tl = require('azure-pipelines-task-lib/task');
import soap = require("soap");


var options = {
    hasNonce: false,
    digestPassword: false,
  };

interface CoverityClient extends soap.Client {
    getProjectsAsync: (params?: any) => any;
}


async function run() {
    try {
        const server: string = tl.getEndpointUrl('coverityService', true);
        console.log(server);

        const username: string = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
        const password: string = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);

        const url = server + "/ws/v9/configurationservice?wsdl";
        
        const projectName = tl.getInput('projectName', true);

        var soapClient = await soap.createClientAsync(url) as any;
        var client = soapClient as CoverityClient;
        
        var wsSecurity = new soap.WSSecurity(username, password, options)
        client.setSecurity(wsSecurity);

        var [result, rawResponse, soapheader, rawRequest] = await client.getProjectsAsync();

        var projects = result.return;
        var project = null;
        projects.forEach((element: any) => {
            if (element.id.name == projectName){
                project = element;
            }
        });

        if (project == null) {
            tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
            return;
        }


        console.log(result.return[0].id);

        console.log("Finished.");
        
        return;

        const inputString: string = tl.getInput('samplestring', true);
        if (inputString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        //console.log('Hello', inputString);

        
    }
    catch (err) {
        console.log("An error occured.");
        tl.setResult(tl.TaskResult.Failed, err.message);
        //console.log(err);
    }
}

run();
