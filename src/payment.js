Vue.component("major-payment", {
  props: {
    pageSelected: {
      type: String,
      required: true
    },
    cart: {
      type: Array,
      required: true
  }
  },
  template: `
      <div v-show="pageSelected === 'Payment'">
        <div style="display: flex;">
          <div class="payment">
            <h3>Carrinho</h3>

            <div
              v-for="(product, index) in cart"
              :key="product.id"
              class="color-box"
              :style="{backgroundColor: product.color}"
              style="display: inline;"
            > 
              <hr class="solid" v-show="index != 0">
              <p style="margin-left: 45px; width: 180px;">
                Produto: {{product.product}} </br>
                Cor: {{product.color}} </br>
                Quantidade: {{product.quantity}} </br>
                Valor unitario: R$ {{product.price}} </br>
                Valor total: R$ {{product.price * product.quantity}}
              </p>
            </div>

            <hr class="solid">
            <span style="font-weight: bold;">Valor total: R$ {{total_value}}</span>
          </div>
          <div class="payment">
            <h3>Formas de pagamento</h3>

            <form id="payment" v-on:submit.prevent="pay">
              <ul>
                <li>
                  <span style="font-weight: bold;">Pix</span> </br>
                  <input type="number" step="0.01" id="valuePix" min="0" :max="value_to_pay('pix')" class="inputValue" v-model="valuePix" value="0"/>
                </li>

                <li>
                  <span style="font-weight: bold;">Cartão Debito</span> </br>
                  <input type="number" step="0.01" id="valueDebit" min="0" :max="value_to_pay('debit')" class="inputValue" v-model="valueDebit" value="0"/>
                </li>

                <li>
                  <span style="font-weight: bold;">Cartão Crédito</span> </br>
                  <input type="number" step="0.01" id="valueCredit" min="0" :max="value_to_pay('credit')" class="inputValue" v-model="valueCredit" value="0"/>
                  <select v-model="installment">
                    <option v-for="option in options" :value="option.value">
                      {{option.text}}
                    </option>
                  </select>
                </li>
              </ul>
            </form>

            <button type="submit" form="payment" class="buttonPay">Pagar</button>
          </div>
          <div class="payment">
            <h3>Valores pagos</h3>

            <ul class="ulPayment">
              <div v-show="totalValuePix.length" class="wrap-toggle">
                <input id="togglePix" class="toggle" type="checkbox">
                <label for="togglePix" class="lbl-toggle">Total pago com Pix: R$ {{total_value_paid('pix')}}</label>
                <div class="toggle-content">
                  <div class="content-inner">
                    <li v-for="value in totalValuePix" style="margin-left: 10px;">
                      R$ {{value}}
                    </li>
                  </div>
                </div>
              </div>

              <div v-show="totalValueDebit.length" class="wrap-toggle">
                <input id="toggleDebit" class="toggle" type="checkbox">
                <label for="toggleDebit" class="lbl-toggle">Total pago com Cartão Debito: R$ {{total_value_paid('debit')}}</label>
                <div class="toggle-content">
                  <div class="content-inner">
                    <li v-for="value in totalValueDebit" style="margin-left: 10px;">
                      R$ {{value}}
                    </li>
                  </div>
                </div>
              </div>

              <div v-show="totalValueCredit.length" class="wrap-toggle">
                <input id="toggleCredit" class="toggle" type="checkbox">
                <label for="toggleCredit" class="lbl-toggle">Total pago com Cartão Crédito: R$ {{total_value_paid('credit')}}</label>
                <div class="toggle-content">
                  <div class="content-inner">
                    <li v-for="ValueCredit in totalValueCredit" style="margin-left: 10px;">
                    R$ {{ValueCredit.value}} dividido em {{ValueCredit.installment}}x
                    </li>
                  </div>
                </div>
              </div>
            </ul>
            <div v-show="totalValuePaid > 0">
              <hr class="solid">
              <span style="font-weight: bold;">Total valor pago: R$ {{totalValuePaid}}</span>
            </div>
          </div>
        </div>
      </div>
  `,
  data() {
      return {
        valuePix: 0.00,
        valueDebit: 0.00,
        valueCredit: 0.00,
        totalValuePaid: 0.00,
        installment: 1,
        options: [
          { text: '1x', value: 1 },
          { text: '2x', value: 2 },
          { text: '3x', value: 3 }
        ],
        totalValuePix: [],
        totalValueDebit: [],
        totalValueCredit: []
      };
  },
  methods: {
    pay() {
      if (this.valuePix > 0) {
        this.totalValuePix.push(this.valuePix);
        this.totalValuePaid +=  parseFloat(this.valuePix);
        this.valuePix = 0.00;
      }
      if (this.valueDebit > 0) {
        this.totalValueDebit.push(this.valueDebit);
        this.totalValuePaid +=  parseFloat(this.valueDebit);
        this.valueDebit = 0.00;
      }
      if (this.valueCredit > 0) {
        this.totalValueCredit.push({value: this.valueCredit, installment: this.installment});
        this.totalValuePaid +=  parseFloat(this.valueCredit);
        this.valueCredit = 0.00;
        this.installment = 1;
      }
    },
    value_to_pay(type) {
      this.verifyValues();
      var inputValues = 0.00;

      if (type === "pix")
        inputValues = parseFloat(this.valueDebit) + parseFloat(this.valueCredit);
      else if (type === "debit")
        inputValues = parseFloat(this.valuePix) + parseFloat(this.valueCredit);
      else if (type === "credit")
        inputValues = parseFloat(this.valueDebit) + parseFloat(this.valuePix);

      return (this.total_value - inputValues - this.totalValuePaid);
    },
    total_value_paid(type) {
      let totalValuePaid = 0;
      if (type === "pix") {
        totalValuePaid = this.totalValuePix.reduce(
          (pValue, cValue) => parseFloat(pValue) + parseFloat(cValue), 0
        );
      }
      else if (type === "debit") {
        totalValuePaid = this.totalValueDebit.reduce(
          (pValue, cValue) => parseFloat(pValue) + parseFloat(cValue), 0
        );
      }
      else if (type === "credit") {
        totalValuePaid = this.totalValueCredit.reduce(
          (pValue, cValue) => parseFloat(pValue) + parseFloat(cValue.value), 0.00
        );
      }
      
      return parseFloat(totalValuePaid).toFixed(2);
    },
    verifyValues() {
      if (this.valuePix == "")
        this.valuePix = 0.00
      if (this.valueDebit == "")
        this.valueDebit = 0.00
      if (this.valueCredit == "")
        this.valueCredit = 0.00
    }
  },
  computed: {
    total_value() {
      var total_value = 0.00;
      this.cart.forEach(product => {
        total_value += (product.price * product.quantity);
      });
      return total_value.toFixed(2);
    }
  }
})