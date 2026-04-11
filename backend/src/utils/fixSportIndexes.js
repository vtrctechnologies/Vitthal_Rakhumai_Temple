import mongoose from "mongoose";
import Sport from "../models/Sport.js";

/**
 * Ensure sport indexes match current requirements:
 * - Unique per (name, year)
 * - NO old unique index on just `name`
 *
 * This runs on server startup and is safe to keep – it will
 * only drop a legacy unique index if it finds one.
 */
const fixSportIndexes = async () => {
  try {
    // Make sure we're connected before touching indexes
    if (mongoose.connection.readyState !== 1) {
      // Connection not fully ready yet; let Mongoose buffering handle it
      // or it will run successfully once the connection is up.
      console.log(
        "fixSportIndexes: Mongo connection not ready yet, proceeding with buffered operations"
      );
    }

    const indexes = await Sport.collection.indexes();

    // Find any unique index that is only on `name`
    const legacyNameOnlyIndex = indexes.find(
      (idx) =>
        idx.unique === true &&
        idx.key &&
        Object.keys(idx.key).length === 1 &&
        idx.key.name === 1
    );

    if (legacyNameOnlyIndex) {
      console.log(
        "fixSportIndexes: Dropping legacy unique index on Sport.name:",
        legacyNameOnlyIndex.name
      );
      await Sport.collection.dropIndex(legacyNameOnlyIndex.name);
    }

    // Ensure the desired compound unique index exists
    // If it already exists, this is a no-op.
    await Sport.collection.createIndex({ name: 1, year: 1 }, { unique: true });

    console.log("fixSportIndexes: Sport indexes verified/updated successfully");
  } catch (err) {
    console.error(
      "fixSportIndexes: Error while fixing Sport indexes:",
      err.message
    );
  }
};

export default fixSportIndexes;
