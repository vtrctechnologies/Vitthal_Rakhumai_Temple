import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8']);
import http from 'http';
import app from './app.js';
import { connect } from './config/db.js';

const port = process.env.PORT || 5000;

const start = async () => {
	try {
		await connect();
		const server = http.createServer(app);
		server.listen(port, () => {
			console.log(`SERVER RUNNING ON PORT ${port}`);
		});
	} catch (err) {
		console.error('Failed to start server due to DB error', err);
		process.exit(1);
	}
};

start();
