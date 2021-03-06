let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  const mainContent = document.querySelector("main");
  const map = document.querySelector("#map-container");
  const restImage = document.querySelector("#restaurant-pic");
  const restInfoDiv = document.querySelector("#restaurant-info");
  const mapSection = document.createElement("section");
  const mapDiv = document.createElement("div");

  if (window.innerWidth < 949 && map !== null) {
    mainContent.removeChild(map);
    mapSection.setAttribute("id", "map-container-mobile");
    mapDiv.setAttribute("id", "map");
    mapDiv.setAttribute("role", "application");
    mapDiv.setAttribute("aria-label", "Map for restaurant");
    mapSection.appendChild(mapDiv);
    restInfoDiv.insertBefore(mapSection, restImage);
    setTimeout(() => {
      initMap();
    }, 200);
  } else {
    initMap();
  }
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          mapboxToken:
            "pk.eyJ1IjoiZGotc2hhcjg4IiwiYSI6ImNqbnVjbWRlcjEzNzIzcHByNW9mcHU4ZGkifQ.g5uLeXHIcB1KRvrt4u14HQ",
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

// Init Map Function on screen change
initMapOnScreenChange = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          mapboxToken:
            "pk.eyJ1IjoiZGotc2hhcjg4IiwiYSI6ImNqbnVjbWRlcjEzNzIzcHByNW9mcHU4ZGkifQ.g5uLeXHIcB1KRvrt4u14HQ",
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(newMap);

      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = `<i id="address-icon" class="fas fa-map-marker-alt"></i> ${
    restaurant.address
  }`;
  const title = document.getElementById("restaurant-title");
  title.innerHTML = restaurant.name;
  title.setAttribute("tabindex", "-1");
  const smallImgSrc = document.querySelector(".src-small-pic");
  smallImgSrc.setAttribute("srcset", `/images/${restaurant.id}-small.jpg`);
  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt", `Image for ${restaurant.name}`);

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    day.classList.add("restaurant-hours-day");
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById("reviews-content");
  const title = document.createElement("h3");
  title.innerHTML = "Reviews";
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  const reviewHead = document.createElement("div");
  const reviewContent = document.createElement("div");
  function generateStars(star, reviewRating) {
    let totalStars = "";
    while (reviewRating > 0) {
      totalStars += star;
      reviewRating--;
    }
    return `
     <div class="stars">
      ${totalStars}
     </div>
    `;
  }
  reviewHead.setAttribute("class", "review-head");
  name.innerHTML = review.name;
  name.setAttribute("class", "review-name");
  reviewHead.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = review.date;
  date.setAttribute("class", "review-date");
  reviewHead.appendChild(date);

  li.appendChild(reviewHead);
  reviewContent.setAttribute("class", "review-content");
  const rating = document.createElement("p");
  rating.innerHTML = ` ${generateStars("⭐", review.rating)}`;
  rating.setAttribute("class", "review-rating");
  reviewContent.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  comments.setAttribute("class", "review-comments");
  reviewContent.appendChild(comments);

  li.appendChild(reviewContent);
  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// Accordion
const accordion = document.querySelector(".accordion-btn");
const restaurantHours = document.getElementById("restaurant-hours");

accordion.addEventListener("click", () => {
  accordionOperator();
});

function accordionOperator() {
  if (accordion.getAttribute("aria-expanded") === "false") {
    accordion.classList.add("active");
    restaurantHours.style.display = "block";
    restaurantHours.style.maxHeight = `${restaurantHours.scrollHeight}px`;
    accordion.setAttribute("aria-expanded", "true");
  } else if (accordion.getAttribute("aria-expanded") === "true") {
    accordion.classList.remove("active");
    restaurantHours.style.maxHeight = 0;
    accordion.setAttribute("aria-expanded", "false");
  }
}

// Screen event listener

window.addEventListener("resize", () => {
  const mainContent = document.querySelector("main");
  const map = document.querySelector("#map-container");
  const mobileMap = document.querySelector("#map-container-mobile");
  const restImage = document.querySelector("#restaurant-pic");
  const restInfoDiv = document.querySelector("#restaurant-info");
  const mapSection = document.createElement("section");
  const mapDiv = document.createElement("div");

  if (window.innerWidth < 949 && map !== null) {
    mainContent.removeChild(map);
    mapSection.setAttribute("id", "map-container-mobile");
    mapDiv.setAttribute("id", "map");
    mapDiv.setAttribute("role", "application");
    mapDiv.setAttribute("aria-label", "Map for restaurant");
    mapSection.appendChild(mapDiv);
    restInfoDiv.insertBefore(mapSection, restImage);
    setTimeout(() => {
      initMapOnScreenChange();
    }, 200);
  } else if (window.innerWidth > 949 && map === null) {
    restInfoDiv.removeChild(mobileMap);
    mapSection.setAttribute("id", "map-container");
    mapDiv.setAttribute("id", "map");
    mapDiv.setAttribute("role", "application");
    mapDiv.setAttribute("aria-label", "Map for restaurant");
    mapSection.appendChild(mapDiv);
    mainContent.appendChild(mapSection);
    setTimeout(() => {
      initMapOnScreenChange();
    }, 200);
  }
});
