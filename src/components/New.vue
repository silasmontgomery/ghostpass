<template>
  <div>
    <div class="card">
      <h2>Enter a passphrase to encrypt/decrypt your safe.</h2>
      <p>Ghostpass uses AES128, AES192, AES256 encryption depending on the complexity of your passphrase. The more complex the passphrase, the better the encryption.
      <form>
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
  </div>
</template>

<script>
export default {
  name: 'New',
  data: function() {
    return {
      passphrase: null,
      confirmPassphrase: null,
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

    }
  }
}
</script>