<script>
import { loadWallets } from "./api";

export default {
  name: "App",
  data() {
    return {
      wallet: "",
      filter: "",

      wallets: [],
      selectedWallet: null,

      graph: [],

      page: 1,
    };
  },

  created() {
    const wallets = localStorage.getItem("crypto-list");
    if (wallets) {
      this.wallets = JSON.parse(wallets);
    }
    setInterval(this.updateWallets, 5000);
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredWallets() {
      return this.wallets.filter((wallet) =>
        wallet.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },
    paginatedWallets() {
      return this.filteredWallets.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredWallets.length > this.endIndex;
    },
    normalizedGraph() {
      if (!this.graph.length) return [];
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      // Avoid division by zero when all values are equal
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
  },

  methods: {
    formatValue(value) {
      if (typeof value !== "number") {
        return value;
      }
      return value > 1 ? value.toFixed(2) : value.toPrecision(2);
    },
    async updateWallets() {
      if (!this.wallets.length) return;
      const exchangeData = await loadWallets(this.wallets.map((w) => w.name));

      this.wallets.forEach((w) => {
        const exchangeValue = exchangeData[w.name.toUpperCase()];
        if (!exchangeValue) {
          w.value = 0;
          return;
        }
        w.value = exchangeValue;
      });
    },

    addWallet() {
      const newWallet = {
        name: this.wallet,
        value: 0,
      };
      this.wallets = [...this.wallets, newWallet];
      // add to local storage
      localStorage.setItem("crypto-list", JSON.stringify(this.wallets));

      this.wallet = "";
      this.filter = "";
    },

    deleteWallet(wallet) {
      this.wallets = this.wallets.filter((w) => w !== wallet);
      if (this.selectedWallet === wallet) {
        this.selectedWallet = null;
      }
      localStorage.setItem("crypto-list", JSON.stringify(this.wallets));
    },

    onSelectedWallet(wallet) {
      this.selectedWallet = wallet;
      this.graph = [];
    },
  },
  watch: {
    paginatedWallets() {
      if (this.paginatedWallets.lenght === 0 && this.page > 1) this.page--;
    },
    selectedWallet() {
      this.graph = [];
    },
    filter() {
      this.page = 1;
    },
  },
};
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Ticker</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="wallet"
                v-on:keydown.enter="addWallet"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="GOLD, CZK, BTC...."
              />
            </div>
            <!-- <div
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BTC
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                DOGE
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BCH
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                CHD
              </span>
            </div>
            <div class="text-sm text-red-600">Такой тикер уже добавлен</div> -->
          </div>
        </div>
        <button
          @click="addWallet"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Add
        </button>
      </section>
      <template v-if="wallets.length > 0 ? true : false">
        <div class="flex space-x-5">
          <button
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page--"
            v-if="page > 1"
          >
            Back
          </button>
          <button
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page++"
            v-if="hasNextPage"
          >
            Next
          </button>
        </div>
        Filter:<input v-model="filter" />

        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="wallet in paginatedWallets"
            :key="wallet.name"
            @click="onSelectedWallet(wallet)"
            :class="{ 'border-4': selectedWallet === wallet }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                USD - {{ wallet.name }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                <div v-if="wallet.value !== null">
                  {{ formatValue(wallet.value) }}
                </div>
                <div v-else>-</div>
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              v-on:click.stop="deleteWallet(wallet)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Delete
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section class="relative" v-if="selectedWallet">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedWallet.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="value in normalizedGraph"
            :key="value"
            :style="{ height: `${value}%` }"
            class="bg-purple-800 border w-10 }"
          ></div>
        </div>
        <button
          @click="selectedWallet = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<style src="../src/app.css"></style>
