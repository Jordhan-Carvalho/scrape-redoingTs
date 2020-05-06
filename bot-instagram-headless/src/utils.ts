import inquirer from "inquirer";

export class Utils {
  static questions = [
    {
      type: "input",
      name: "name",
      message: "Qual seu email?",
    },
    {
      type: "password",
      name: "password",
      message: "Qual seu password?",
    },
  ];

  static async getUserData(): Promise<any> {
    const resp = await inquirer.prompt(this.questions).then((answers) => {
      console.log(`Olá ${answers.name}! Iniciando processo`);
      return answers;
    });
    return resp;
  }
}
