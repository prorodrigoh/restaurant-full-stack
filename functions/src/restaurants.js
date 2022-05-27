import connectDb from "../connectDb.js";

export function getAllRestaurants(req, res) {
  const db = connectDb();
  db.collection("restaurants").get()
    .then(snapshot => {
      const restaurantArray = snapshot.docs.map(doc => {
        let restaurant = doc.data();
        restaurant.id = doc.id;
        return restaurant;
      });
      res.send(restaurantArray);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

export function getRestaurantById(req, res) {
  const { restaurantId } = req.params;
  if(!restaurantId) {
    res.status(401).send('Invalid request');
    return;
  }
  const db = connectDb();
  db.collection("restaurants").doc(restaurantId).get()
    .then(doc => {
      let restaurant = doc.data();
      restaurant.id = doc.id;
      res.send(restaurant);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

export function addRestaurant(req, res) {
  if(!req.body) {
    res.status(401).send('Invalid request');
    return;
  }
  const db = connectDb();
  db.collection('restaurants').add(req.body)
    .then(doc => {
      res.send('Restaurant created ' + doc.id)
    })
    .catch(err => {
      res.status(500).send(err);
    });
}



export function updateRestaurant(req, res) {
  if(!req.params || !req.params.restaurantId || !req.body) {
    res.status(401).send('Invalid request');
    return;
  }
  const { restaurantId } = req.params;
  const db = connectDb();
  db.collection('restaurants').doc(restaurantId).update(req.body)
    .then(() => {
      res.send('Restaurant updated.');
    })
    .catch(err => {
      res.status(500).send(err);
    });
}


export function updateRating(req, res) {
  if(!req.params || !req.params.restaurantId || req.body.rating > 5 || req.body.rating < 0) {
    res.status(401).send('Invalid request');
    return;
  }
  const { restaurantId } = req.params;
  let newRating = req.body.rating

  const db = connectDb();

  db.collection('restaurants').doc(restaurantId).get()
    .then(doc => {
      // get rating history from DB
      const {ratingHistory} = doc.data()
      // add new
      const newRatingHistory = (ratingHistory) ? [...ratingHistory, newRating] : [newRating]
      // calculate new average
      const numRatings = newRatingHistory.length
      const rating = newRatingHistory.reduce((accum, elem) => accum + elem, 0)/ numRatings
      // create object with new values
      const updatedData = { ratingHistory: newRatingHistory, numRatings, rating }
      // update the database & return the promise to the next .then
      return db.collection('restaurants').doc(restaurantId).update(updatedData)
    })
    .then(() => getRestaurantById(req, res)
    )    
    .catch(err => {
      res.status(500).send(err);
    });
}

export function deleteRestaurant(req, res) {
  const { restaurantId } = req.params;
  if(!restaurantId) {
    res.status(401).send('Invalid request');
    return;
  }
  const db = connectDb();
  db.collection("restaurants").doc(restaurantId).delete()
    .then(() => {
      res.send('Restaurant deleted.');
    })
    .catch(err => {
      res.status(500).send(err);
    });
}