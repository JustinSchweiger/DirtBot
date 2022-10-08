# How to Deploy:

1. Navigate to a folder where you want to install DirtBot
2. Clone the repository: `git clone https://github.com/JustinSchweiger/DirtBot.git`
3. Navigate to the folder: `cd DirtBot`
4. Install the dependencies: `npm install`
5. Install pm2 globally: `npm install pm2 -g`
6. Use `nano .env` and input the secrets.
7. Run the deployment script: `bash deploy.sh`

## How to Update:

- Run the deployment script again. It will fetch from GitHub and install all dependencies. Afterwards it will restart the bot.