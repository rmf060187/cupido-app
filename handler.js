"use strict";

const infoMensagens = [];

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { enviarEmail } = require("./enviar-email");
const envioEmail = enviarEmail();

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "MENSAGENS",
};

module.exports.listarMensagens = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknow error",
      }),
    };
  }
};

module.exports.obterMensagem = async (event) => {
  try {
    const { mensagemId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        ...params,
        Key: {
          mensagem_id: mensagemId,
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Mensagem não existe" }, null, 2),
      };
    }

    const mensagem = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(mensagem, null, 2),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.cadastrarMensagem = async (event) => {
  try {
    const timestamp = moment().format("DD-MM-YYYY");

    let dados = JSON.parse(event.body);

    const { nome, nome_destinatario, email_destinatario, texto } = dados;

    const mensagem = {
      mensagem_id: uuidv4(),
      nome,
      nome_destinatario,
      email_destinatario,
      texto,
      status: true,
      enviado_em: timestamp,
    };

    await dynamoDb
      .put({
        TableName: "MENSAGENS",
        Item: mensagem,
      })
      .promise();

    envioEmail;

    return {
      statusCode: 201,
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.excluirMensagem = async (event) => {
  const { mensagemId } = event.pathParameters;

  try {
    await dynamoDb
      .delete({
        ...params,
        Key: {
          mensagem_id: mensagemId,
        },
        ConditionExpression: "attribute_exists(mensagem_id)",
      })
      .promise();

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "Mensagem não existe";
      message = `Recurso com o ID ${mensagemId} não existe e não pode ser atualizado`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};
