/**
  *
  * main() será executado quando você chamar essa ação
  *
  * @param As ações do Cloud Functions aceitam um único parâmetro, que deve ser um objeto JSON.
  *
  * @return A saída dessa ação, que deve ser um objeto JSON.
  *
  */
const request = require('request');
const btoa = require('btoa');
function main(params) {
// https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/ml-authentication.html#rest-api
  const apikey = "LLTqONVUvUvnculH9hq9B_A_D2dg9Kf1wF06xP-VWFMs"
  const IBM_Cloud_IAM_uid = "bx";
  const IBM_Cloud_IAM_pwd = "bx";
  const getToken = () => {
      const options = {
          url: "https://iam.bluemix.net/oidc/token",
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: "Basic " + btoa( IBM_Cloud_IAM_uid + ":" + IBM_Cloud_IAM_pwd ),
          },
          body: "apikey=" + apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey",
          json: true
      };
      return new Promise((resolve, reject) => {
          request.post(options, (error, resp, body) => {
              if (error) reject(error);
              else {
                // console.log(body)
                resolve(body.access_token);
              }
          });
      });
  };

  return new Promise((resolve, reject) => {
      const body = {
            fields: ["viagem", "bebida", "genero", "hobby"],
            values: [[params.viagem, params.bebida, params.genero, params.hobby]]
        };

      getToken().then(token => {
          const options = {
              // TODO: Substituir com SCORING END-POINT do Deployment do Modeler flow
              url: "https://us-south.ml.cloud.ibm.com/v3/wml_instances/cb3cc0dc-f529-4fd3-aea6-32cd11922fa0/deployments/2bd2e374-71b6-4037-971e-acf1f73ceab5/online",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
              body: body,
              json: true
          };
          // console.log(body)
          request.post(options, (error, resp, data) => {
              if (error) reject(error);
              else if (data.errors) {
                  resolve({
                      "err": true,
                      "produto": data.errors[0].message
                  });
              }
              else {
                  resolve({
                      "err": false,
                      "produto": data.values[0][0]
                  });
              }
          });
      }).catch(err => reject(err));
  });
}