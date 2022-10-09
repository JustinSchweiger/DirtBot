import mysql from 'mysql2/promise';

(async () => {
    let verificationDB;
    try {
        verificationDB = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.VERIFICATION_DATABASE,
        });
    } catch (err) {
        console.log('❌ The verification database can\'t be reached!');
    }

    if (verificationDB) {
        console.log('✅ The verification database can be reached!');
    }

    let punishmentDB;
    try {
        punishmentDB = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.PUNISHMENT_DATABASE,
        });
    } catch (err) {
        console.log('❌ The punishment database can\'t be reached!');
    }

    if (punishmentDB) {
        console.log('✅ The punishment database can be reached!');
    }
})();