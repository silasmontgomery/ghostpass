<template>
  <div>
    <div v-if="safe" class="card">
      <a href="#" class="tag" v-for="(tag, index) in safe.tags" :key="index" @click.prevent="tagClick(tag)">{{ tag }}</a>
    </div>
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
          <tr v-for="(password, index) in filteredPasswords" :key="index">
            <td>{{ password.title }}</td>
            <td>{{ password.username }} <a href="#" @click.prevent="copyToClipboard(password.username)"><i class="material-icons">attachment</i></a></td>
            <td>{{ mask(password.password) }} <a href="#" @click.prevent="copyToClipboard(password.password)"><i class="material-icons" >attachment</i></a></td>
            <td><span class="tag" v-for="(tag, index) in password.tags" :key="index">{{ tag }}</span></td>
            <td>
              <a href="#" @click.prevent="editEntry(index)"><i class="material-icons">edit</i></a> 
              <a class="danger" href="#" @click.prevent="deleteEntry(index)"><i class="material-icons">delete</i></a>
            </td>
          </tr>
          <tr>
            <td><input class="appearance-none border w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none" type="text" v-model="title" placeholder="Title" /></td>
            <td><input class="appearance-none border w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none" type="text" v-model="username" placeholder="Username" /></td>
            <td><input class="appearance-none border w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none" type="text" v-model="password" placeholder="Password" @keyup.enter="saveEntry" /></td>
            <td>
              <vue-tags-input 
                v-model="tag"
                :tags="tags"
                :autocomplete-items="filteredItems"
                @tags-changed="newTags => tags = newTags">
              </vue-tags-input>
            </td>
            <td><button class="btn btn-sm btn-blue" :disabled="!title || !username || !password" @click="saveEntry">Save</button></td>
          </tr>
        </tbody>
      </table>
      <div class="mt-3 text-gray-700">
        Per Page: 
        <select class="bg-white border p-1 text-gray-700" v-model="perPage" @change="perPageChanged">
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span class="ml-2" v-if="pages > 1">
          Page: <a href="#" @click.prevent="currentPage > 1 ? currentPage-- : false">&lt;&lt;</a>
          <a href="#" v-for="page in pages" :key="page" class="mx-1" :class="currentPage == page ? 'font-bold':''" @click.prevent="currentPage=page">{{ page }}</a>
          <a href="#" @click.prevent="currentPage < pages ? currentPage++ : false">&gt;&gt;</a>
        </span>
      </div>
    </div>
    <div v-if="!notFound && !safe" class="card">
      <h2>Enter a passphrase to decrypt this Ghostpass safe.</h2>
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="passphrase">
            Passphrase
          </label>
          <input :class="error.passphrase ? 'border-red-500':''" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" v-model="passphrase" id="passphrase" type="password" placeholder="******************" autocomplete="new-password" />
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
      tag: '',
      tags: [],
      searchText: '',
      searchTags: [],
      currentPage: 1,
      perPage: 10,
      pages: 0,
      notFound: false,
      error: {}
    }
  },
  mounted: function() {
    this.uid = this.$route.params.uid
    this.fetchSafe()
  },
  computed: {
    filteredPasswords: function() {
      let results = this.safe.passwords;
      if(this.searchText.length > 0) {
        results = this.safe.passwords.filter(password => 
          password.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
          password.username.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }

      return results.slice((this.currentPage * this.perPage) - this.perPage, (this.currentPage * this.perPage))
    },
    filteredItems: function() {
      return this.safe.tags.filter(i => {
        return i.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
      });
    },
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
      try {
        let bytes = this.$crypto.AES.decrypt(this.encryptedSafe, this.passphrase)
        this.safe = JSON.parse(bytes.toString(this.$crypto.enc.Utf8))
        this.pages = Math.ceil(this.safe.passwords.length / this.perPage)
      }
      catch(err) {
        this.$emit('flash', { message: 'Problem decrypting safe. Wrong password?', success: false })
        this.passphrase = null
      }
    },
    saveEntry: function() {
      let entry = {
        title: this.title,
        username: this.username,
        password: this.password,
        tags: this.tags.map(t => t.text)
      }
      this.safe.passwords.push(entry)
      this.safe.passwords.sort((a, b) => (a.title > b.title) ? 1 : -1)
      this.title = null
      this.username = null
      this.password = null
      this.tags = []
      this.saveSafe('Safe updated')
    },
    saveSafe: function(message) {
      this.updateTags();
      this.encryptedSafe = this.$crypto.AES.encrypt(JSON.stringify(this.safe), this.passphrase).toString()
      this.$http.put('/api/safe/' + this.uid, {
        uid: this.uid,
        safe: this.encryptedSafe
      })
      .then((response) => {
        console.log(response)
        this.$emit('flash', { message: message, success: true })
      })
      .catch((error) => {
        console.log(error.response)
      })
    },
    deleteEntry: function(delIndex) {
      if(confirm('Are you sure you want to delete this entry?')) {
        let passwords = []
        this.safe.passwords.forEach((password, index) => {
          if(delIndex != index) {
            passwords.push(password)
          }
        })
        this.safe.passwords = passwords;
        this.safe.passwords.sort((a, b) => (a.title > b.title) ? 1 : -1)
        this.saveSafe('Password deleted')
      }
    },
    updateTags: function() {
      this.safe.passwords.forEach(password => {
        password.tags.forEach(tag => {
          if(!this.safe.tags.find(t => t.toLowerCase() == tag.toLowerCase())) {
            this.safe.tags.push(tag)
          }
        })
      })
      this.safe.tags.sort((a, b) => (a > b) ? 1 : -1)
    },
    mask: function(text) {
      let masked = ''
      for(var i=0; i<text.length; i++) {
        masked += '*'
      }
      return masked;
    },
    tagClick: function(item) {
      if(this.searchTags.findIndex(t => t == item) == -1) {
        this.searchTags.push(item)
      }
    },
    copyToClipboard: function(text) {
      let el = document.createElement('textarea')
      el.value = text;
      el.setAttribute('readonly', '')
      el.style = {position: 'absolute', left: '-9999px'}
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy')
      document.body.removeChild(el)
      this.$emit('flash', { message: 'Copied to clipboard', success: true })
    },
    perPageChanged: function() {
      this.pages = Math.ceil(this.filteredPasswords.length / this.perPage)
      this.currentPage = 1
    }
  }
}
</script>
