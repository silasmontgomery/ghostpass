<template>
  <div>
    <div class="card p-4" v-if="!created">
      <h2>Enter a passphrase to encrypt/decrypt your safe.</h2>
      <p>Ghostpass uses AES128, AES192, AES256 encryption depending on the complexity of your passphrase. The more complex the passphrase, the better the encryption.
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Passphrase
          </label>
          <input :class="error.passphrase ? 'border-red-500':''" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" v-model="passphrase" type="password" placeholder="******************" autocomplete="new-password" />
          <p v-if="error.passphrase" class="text-red-500 text-xs italic">{{ error.passphrase }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Passphrase (repeat)
          </label>
          <input :class="error.confirmPassphrase ? 'border-red-500':''" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" v-model="confirmPassphrase" type="password" placeholder="******************" autocomplete="new-password" />
          <p v-if="error.confirmPassphrase" class="text-red-500 text-xs italic">{{ error.confirmPassphrase }}</p>
        </div>
        <button :disabled="!ready" class="btn btn-blue" @click="createSafe">Create Ghostpass Password Safe</button>
      </form>
    </div>
    <div class="card p-4" v-if="created">
      <h2>Your seed words (write these down someplace safe):</h2>
      <p class="bg-gray-200 font-mono text-lg">{{ seed }}</p>
      <p class="font-hairline">You'll need these words to get your unique URL if you lose or forget it.</p>
      <h2>Your Ghostpass Unique URL (be sure to bookmark):</h2>
      <p class="bg-gray-200 text-lg"><a :href="'/safe/' + uid" target="_blank">{{ '/safe/' + uid }}</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'New',
  data: function() {
    return {
      passphrase: null,
      confirmPassphrase: null,
      seed: null,
      uid: null,
      url: null,
      safe: null,
      created: false,
      error: {},
    }
  },
  watch: {
    passphrase: function(passphrase) {
      this.error.passphrase = null
      if(passphrase.length < 6) {
        this.error.passphrase = "Minimum passphrase length is 6 characters."
      }
    },
    confirmPassphrase: function(confirmPassphrase) {
      this.error.confirmPassphrase = null;
      if(confirmPassphrase != this.passphrase) {
        this.error.confirmPassphrase = "Passphrases do not match."
      }
    }
  },
  computed: {
    ready: function() {
      if(this.passphrase && this.passphrase.length > 6 && this.passphrase == this.confirmPassphrase) {
        return true
      }
      return false
    }
  },
  methods: {
    createSafe: function() {
      this.$http.post('/api/safe')
      .then((response) => {
        console.log(response)
        this.uid = response.data.uid
        this.seed = response.data.seed
        this.safe = {
          uid: this.uid,
          passwords: [],
          tags: []
        }
        this.saveSafe();
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {

      })
    },
    saveSafe: function() {
      this.$http.put('/api/safe/' + this.uid, {
        safe: this.$crypto.AES.encrypt(JSON.stringify(this.safe), this.passphrase).toString()
      })
      .then((response) => {
        console.log(response)
        this.created = true
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {

      })
    }
  }
}
</script>