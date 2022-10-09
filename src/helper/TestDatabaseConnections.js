import mysql from 'mysql2/promise';

(async () => {
    try {
        await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.VERIFICATION_DATABASE,
        });
    } catch (err) {
        console.log('❌ The verification database can\'t be reached!');
    }

    console.log('✅ The verification database can be reached!');

    try {
        await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.PUNISHMENT_DATABASE,
        });
    } catch (err) {
        console.log('❌ The punishment database can\'t be reached!');
    }

    console.log('✅ The punishment database can be reached!');
})();