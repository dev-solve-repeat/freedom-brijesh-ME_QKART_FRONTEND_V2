import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";
import ProductCard from "./ProductCard";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const [apidata, setApiData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [cartFullDetails, setCartFullDetails] = useState([]);
  const [noProductFound, setNoProductFound] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(500);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      setLoading(true);
      let res = await axios.get(`${config.endpoint}/products`);
      let data = res.data;

      setApiData(data);
      setFilteredData(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);

      if (err.response && err.response.status === 400) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      setLoading(true);
      let res = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setApiData(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 404) {
        setNoProductFound(true);
        enqueueSnackbar("No Products Found", { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeOut = setTimeout(() => {
      performSearch(event.target.value);
    }, 500);
    setDebounceTimeout(timeOut);
  };

  useEffect(() => {
    performAPICall();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCart(localStorage.getItem("token"))
        .then((cartItems) => {
          return generateCartItemsFrom(cartItems, apidata);
        })
        .then((res) => {
          setCartFullDetails(res);
        });
    }
  }, [apidata]);

  /**
   {/* * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200 */
  // };
  // {
  //   /* * [
  //    *      {
  //    *          "productId": "KCRwjF7lN97HnEaY",
  //    *          "qty": 3
  //    *      },
  //    *      {
  //    *          "productId": "BW0jAAeDJmlZCF8i",
  //    *          "qty": 1
  //    *      }
  //    * ] */
  // }

  /* * Example for failed response from backend:
   * HTTP 401 */

  /* * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * } */

  const fetchCart = async (token) => {
    if (!token) {
      return {
        success: false,
        message: "Protected route, Oauth2 Bearer token not found",
      };
    }

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let data = res.data;
      setCartData(data);

      return data;
    } catch (e) {
      if (e.response && e.response.status === 401) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  /* // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */

  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (productId === items[i].productId) {
        return true;
      }
    }
    return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (token) {
      if (isItemInCart(items, productId) === false) {
        //prevent duplication
        try {
          let res = await axios.post(
            `${config.endpoint}/cart`,
            { productId: productId, qty: qty },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          let data = res.data;

          let fullDetails = generateCartItemsFrom(data, apidata);
          setCartFullDetails(fullDetails);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            enqueueSnackbar(err.response.data.message, { variant: "error" });
          } else {
            enqueueSnackbar(
              "Could not post data in the cart. Check that the backend is running, reachable and returns valid JSON.",
              {
                variant: "error",
              }
            );
          }
        }
      } else {
        //"change quantity of item from + or -"
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
      }
    } else {
      //"Login and Add product"
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
    }
  };

  const handleQuantity = async (token, items, products, productId, qty) => {
    if (token) {
      try {
        let res = await axios.post(
          `${config.endpoint}/cart`,
          { productId: productId, qty: qty },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let data = res.data;

        // setCartData(data);
        let fullDetails = generateCartItemsFrom(data, apidata);

        setCartFullDetails(fullDetails);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          enqueueSnackbar(err.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not post data in the cart. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }
    }
  };

  return (
    <div>
      <Header children>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          name="Search for items/categories"
          variant="outlined"
          placeholder="Search for items/categories"
          onChange={(e) => {
            debounceSearch(e, 500);
          }}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        onChange={(e) => {
          debounceSearch(e, 500);
        }}
        name="Search for items/categories"
        variant="outlined"
        placeholder="Search for items/categories"
      />

      <Grid container>
        <Grid item className="product-grid" md={9} xs={12}>
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {loading ? (
            <Box className="loading" sx={{ m: "0 auto" }}>
              <CircularProgress />
              <p>Loading Products</p>
            </Box>
          ) : (
            <Grid>
              {!noProductFound ? (
                <Grid
                  container
                  sx={{ m: 2 }}
                  rowSpacing={1}
                  columnSpacing={{ xs: 1, sm: 1, md: 1 }}
                >
                  {apidata.map((item) => {
                    return (
                      <Grid key={item.name} item xs={6} md={3}>
                        <ProductCard
                          key={item._id}
                          product={item}
                          handleAddToCart={() => {
                            addToCart(
                              localStorage.getItem("token"),
                              cartFullDetails,
                              apidata,
                              item._id,
                              1,
                              { preventDuplicate: true }
                            );
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <div className="loading" sx={{ m: "0 auto" }}>
                  <SentimentDissatisfied />
                  <span>
                    <h5>No Products Found</h5>
                  </span>
                </div>
              )}
            </Grid>
          )}
        </Grid>
        {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
        {localStorage.length > 0 && (
          <Grid item container direction="column" md={3} xs={12}>
            <Box item style={{ position: "relative" }}>
              {/* {localStorage.length > 0 && <Cart />} */}
              <Cart
                products={apidata}
                items={cartFullDetails}
                handleQuantity={handleQuantity}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      {/* </Grid> */}

      <Footer />
    </div>
  );
};

export default Products;
