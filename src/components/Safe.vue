<template>
  <div>
    <div v-if="safe" class="card">
      <table class="w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Username</th>
            <th>Password</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(password, index) in safe.passwords" :key="index">
            <td>{{ password.title }}</td>
            <td>{{ password.username }}</td>
            <td>{{ mask(password.password) }}</td>
            <td>{{ password.tags.join(', ') }}</td>
            <td></td>
          </tr>
          <tr>
            <td><input class="shadow appearance-none border rounded w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model="title" placeholder="Title" /></td>
            <td><input class="shadow appearance-none border rounded w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model="username" placeholder="Username" /></td>
            <td><input class="shadow appearance-none border rounded w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model="password" placeholder="Password" @keyup.enter="saveEntry" /></td>
            <td></td>
            <td><button class="btn btn-sm btn-blue" :disabled="!title || !username || !password" @click="saveEntry">Save</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!notFound && !safe" class="card">
      <h2>Enter a passphrase to decrypt this Ghostpass safe.</h2>
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Passphrase
          </label>
          <input :class="error.passphrase ? 'border-red-500':''" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" v-model="passphrase" type="password" placeholder="******************" autocomplete="new-password" />
          <p v-if="error.passphrase" class="text-red-500 text-xs italic">{{ error.passphrase }}</p>
        </div>
        <button :disabled="!passphrase || passphrase.length < 6" class="btn btn-blue" @click="decryptSafe">Decrypt and open safe</button>
      </form>
    </div>
    <div v-if="notFound" class="card">
      <h1 :class="notFound ? 'text-red-700':''">{{ notFound.status }} Error ({{ notFound.statusText }})</h1>
      <h2 v-if="notFound.data && notFound.data.error">{{ notFound.data.error }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Safe',
  data: function() {
    return {
      uid: null,
      safe: null,
      encryptedSafe: null,
      passphrase: null,
      title: null,
      username: null,
      password: null,
      tags: [],
      notFound: false,
      error: {}
    }
  },
  mounted: function() {
    this.uid = this.$route.params.uid
    this.fetchSafe()
  },
  methods: {
    fetchSafe: function() {
      this.$http.get('/api/safe/' + this.uid)
      .then((response) => {
        console.log(response)
        this.encryptedSafe = response.data.safe
      })
      .catch((error) => {
        console.log(error.response)
        this.notFound = error.response
      })
      .finally(() => {

      })
    },
    decryptSafe: function() {
      let bytes = this.$crypto.AES.decrypt(this.encryptedSafe, this.passphrase)
      this.safe = JSON.parse(bytes.toString(this.$crypto.enc.Utf8))
    },
    saveEntry: function() {
      let entry = {
        title: this.title,
        username: this.username,
        password: this.password,
        tags: this.tags
      }
      this.safe.passwords.push(entry)
      this.title = null
      this.username = null
      this.password = null
      this.tags = []
      this.saveSafe()
    },
    saveSafe: function() {
      this.encryptedSafe = this.$crypto.AES.encrypt(JSON.stringify(this.safe), this.passphrase).toString()
      this.$http.put('/api/safe/' + this.uid, {
        uid: this.uid,
        safe: this.encryptedSafe
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error.response)
      })
    },
    mask: function(text) {
      let masked = ''
      for(var i=0; i<text.length; i++) {
        masked += '*'
      }
      return masked;
    }
  }
}
</script>
