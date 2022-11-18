var eventBus = new Vue();

Vue.component("major-store", {
  props: {
    pageSelected: {
      type: String,
      required: true
    }
  },
  template: `
      <div v-show="pageSelected === 'Store'">
          <div>
              <div class="cart">
                  <p>Cart({{cart.length}})</p>
                  <ul>
                    <li v-for="product in cart" style="margin-bottom: 10px;">
                      Produto: {{product.product}} {{product.color}} </br>
                      Quantidade: {{product.quantity}}
                    </li>
                  </ul>
                  <button
                      style="
                          margin-bottom: 10px;
                          margin-top: 10px;
                          float: right;"
                      @click="cleanCart()"
                      v-show="cart.length"
                  >
                      Limpar carrinho
                  </button>
              </div>
              <product
                  premium="premium"
                  @add-cart="updateCart"
              ></product>
          </div>
      </div>
  `,
  data() {
      return {
          premium: true,
          cart: []
      };
  },
  methods: {
    cleanCart(newProduct) {
      eventBus.$emit("clean-cart", this.cart);
      this.cart = [];
      this.emitCart();
    },
    updateCart(newProduct) {
      var oldProduct = this.cart.filter(product => {
        return product.id === newProduct.id;
      })
      if (oldProduct.length) 
        oldProduct[0].quantity++;
      else
        this.cart.push(newProduct)

        this.emitCart();
    },
    emitCart() {
      this.$emit(
        "update-cart",
        this.cart
      );
    }
  }
})

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">
    <div class="product-image">
      <img :src="image" />
    </div>

    <div class="product-info">
      <h1>{{ variants[variantSeleted].variantProduct }}</h1>
      <p>{{mensaginStock}}</p>
      <p>Frete: {{shipping}}</p>

      <ul>
        <li v-for="detail in details">{{detail}}</li>
        <ul>
          <li v-for="color in colors">{{color}}.</li>
        </ul>
      </ul>

      <div
        v-for="(variant, index) in variants"
        :key="variant.variantId"
        class="color-box"
        :style="{backgroundColor: variant.variantColor}"
        @mouseover="updateProduct(index)"
      > 
        <p style="margin-left: 45px; width: 150px;">
          Quantidade: {{variant.variantQuantity}} </br>
          Valor: {{variant.variantPrice}}
        </p>
      </div>

      <button
        @click="addToCart"
        :disabled="!inStock"
        :class="{ disabledButton: !inStock }"
      >
        Adicionar ao Carrinho
      </button>

    </div>

    <tabs-product :reviews="reviews"></tabs-product>

  </div>
  `,
  data() {
    return {
      variantSeleted: 0,
      details: ["100% Algodao.", "Unissex.", "Disponivel nas cores:"],
      colors: ["Verde", "Azul"],
      variants: [
        {
          variantId: 111,
          variantProduct: "Meias",
          variantPrice: 13.99,
          variantColor: "green",
          variantImage: "assets/vmSocks-green.jpg",
          variantQuantity: 22
        },
        {
          variantId: 222,
          variantPrice: 17.99,
          variantProduct: "Meias",
          variantColor: "blue",
          variantImage: "assets/vmSocks-blue.jpg",
          variantQuantity: 9
        }
      ],
      reviews: []
    };
  },
  methods: {
    addToCart() {
      this.variants[this.variantSeleted].variantQuantity--;
      var color;
      if (this.variants[this.variantSeleted].variantColor == "green")
        color = "verdes";
      else
        color = "azuis";

      this.$emit(
        "add-cart",
        {
          id: this.variants[this.variantSeleted].variantId,
          product: this.variants[this.variantSeleted].variantProduct,
          price: this.variants[this.variantSeleted].variantPrice,
          color: color,
          quantity: 1,
        }
      );
    },
    updateProduct(index) {
        this.variantSeleted = index;
    }
  },
  computed: {
    image() {
      return this.variants[this.variantSeleted].variantImage;
    },
    inStock() {
      return this.variants[this.variantSeleted].variantQuantity;
    },
    mensaginStock() {
      if (this.inStock > 10) {
        return "Em estoque";
      } else if (this.inStock > 0) {
        return "Ultimas unidades!";
      } else {
        return "Fora de estoque.";
      }
    },
    shipping() {
      if (this.premium) {
        return "Gratis";
      }
      return "R$9,99";
    }
  },
  mounted() {
    eventBus.$on("review-submitted", (productReview) => {
      this.reviews.push(productReview);
    });
    eventBus.$on("clean-cart", (cart) => {
      cart.forEach(cartProduct => {
        var variant = this.variants.filter(variantProduct => {
          return variantProduct.variantId === cartProduct.id;
        })
        variant[0].variantQuantity += cartProduct.quantity;
      });
    });
  }
});

Vue.component("product-review", {
  template: `
  <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
      <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
      <ul>
        <li v-for="error in errors">{{error}}</li>
      </ul>
    </p>
  
    <p>
      <label for="name">Nome:</label>
      <input id="name" v-model="name" />
    </p>

    <p>
      <label for="review">Avaliacao:</label>
      <textarea id="review" v-model="review"></textarea>
    </p>

    <p>
      <label for="score">Nota:</label>
      <select id="score" v-model.number="score">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>

    <p>
      <input type="submit" value="Enviar" />
    </p>
  </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      score: null,
      errors: []
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.score && this.review) {
        let productReview = {
          name: this.name,
          review: this.review,
          score: this.score
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.score = null;
      } else {
        this.errors = [];
        if (!this.name) this.errors.push("Nome e obrigatorio!");
        if (!this.review) this.errors.push("Avaliacao e obrigatorio!");
        if (!this.score) this.errors.push("Nota e obrigatoria!");
      }
    }
  }
});

Vue.component("tabs-product", {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div style="margin-top: 50px; margin-left: 100px;">
      <span class="tab"w
        :class="{ activeTab: tabSelected === tab }"
        v-for="(tab, index) in tabs"
        :key="index"
        @click="tabSelected = tab">
        {{ tab }}
      </span>

      <div v-show="tabSelected === 'Reviews'">
        <p v-if="!reviews.length">Nao existe nenhuma avaliacao ainda</p>
        <ul>
          <li v-for="review in reviews">
            <p style="font-weight: bold;">{{ review.name }}</p>
            <div style="display: flex;">
              <p>Nota: </p>
              <div v-for="n in review.score" style="width:40px; height:40px;">
                <img src="assets/star.png" alt="Star" style="margin: 0; margin-top: 10px;">
              </div>
            </div>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>

      <product-review v-show="tabSelected === 'Make a Review'"></product-review>
    </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review"],
      tabSelected: "Reviews"
    };
  }
});
