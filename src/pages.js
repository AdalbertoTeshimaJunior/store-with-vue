Vue.component("major-pages", {
  props: {
    cart: {
        type: Array,
        required: true
    }
  },
  template: `
    <div>
        <h1 style="
                display: flex;
                align-items: center;
                justify-content: center;"
        >
            {{title}}
        </h1>
        <div>
        <button
          class="buttonPages"
          @click="changePageSelected('Store')"
          v-show="pageSelected === 'Payment'"
        >
          Voltar
        </button>
        <button
          class="buttonPages"
          @click="changePageSelected('Payment')"
          v-show="pageSelected === 'Store' && cart.length"
        >
          Pagar
        </button>
        <button
        class="buttonPages"
          style="background-color: white;"
          v-show="pageSelected === 'Store' && !cart.length"
        >
        </button>
        </div>
    </div>
  `,
  data() {
    return {
      pages: ["Store", "Payment"],
      pageSelected: "Store"
    };
  },
  methods: {
    changePageSelected(page) {
      this.pageSelected = page;
      this.$emit(
          "change-page-selected",
          this.pageSelected
      );
    }
  },
  computed: {
    title() {
      if (this.pageSelected == "Store")
        return "Loja"
      else (this.pageSelected == "Payment")
        return "Pagamento"
    }
  }
})

var pages = new Vue({
  el: "#pages",
  data: {
    pageSelected: "Store"
  },
  methods: {
    changePageSelected(page) {
        this.pageSelected = page;
    }
  }
});
