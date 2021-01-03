import * as awsx from "@pulumi/awsx";

const serverListener = new awsx.elasticloadbalancingv2.NetworkListener(
  "server-listener",
  { port: 4000 }
);
const serverService = new awsx.ecs.FargateService("server-service", {
  waitForSteadyState: false,
  taskDefinitionArgs: {
    containers: {
      serversideService: {
        image: awsx.ecs.Image.fromPath("server-service", "../server"),
        memory: 512,
        portMappings: [serverListener],
      },
    },
  },
  desiredCount: 1,
});

const clientListener = new awsx.elasticloadbalancingv2.NetworkListener(
  "client-listener",
  { port: 80 }
);
const clientService = new awsx.ecs.FargateService("client-service", {
  waitForSteadyState: false,
  taskDefinitionArgs: {
    containers: {
      clientsideService: {
        image: awsx.ecs.Image.fromPath("client-service", "../client"),
        memory: 512,
        portMappings: [clientListener],
        environment: [
          {
            name: "SERVER_URI",
            value: serverListener.endpoint.hostname,
          },
        ],
      },
    },
  },
  desiredCount: 1,
});

export let CLIENT = clientListener.endpoint.hostname;
export let SERVER = serverListener.endpoint.hostname;
