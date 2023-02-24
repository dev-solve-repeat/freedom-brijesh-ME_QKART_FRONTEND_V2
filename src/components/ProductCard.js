import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import React from "react";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="300px"
        width="500px"
        image={product.image}
        title={product.name}
        aria-label={`${product.rating}stars`}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
          ${product.cost}
        </Typography>
        <Rating
          name="simple-controlled"
          value={product.rating}
          // onChange={(event, newValue) => {
          //   setValue(newValue);
          
          emptyIcon={<StarBorderIcon fontSize="inherit" />}
        />
        <Button variant="contained" className="card-button" onClick={handleAddToCart}>
          <AddShoppingCartIcon />
          ADD TO CART
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
