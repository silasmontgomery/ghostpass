<template>
  <div>
    <div v-if="safe" class="w-12 fixed z-50 right-0 bottom-0 mr-2 mb-8 pt-1 rounded-lg shadow bg-white text-center">
      <a href="#" @click.prevent="addPassword = !addPassword"><i class="material-icons text-4xl"><span v-if="!addPassword">add_circle</span><span v-if="addPassword">remove_circle</span></i></a> 
      <a href="#" @click.prevent="lockSafe"><i class="material-icons text-4xl">lock_open</i></a>
      <a href="#" class="danger" @click.prevent="newSafe"><i class="material-icons text-4xl">fiber_new</i></a>
    </div>
    <div v-if="safe">
      <div class="mb-4">
        <input class="mb-2 focus:outline-none" type="text" v-model="searchText" placeholder="Search" />
        <div class="whitespace-no-wrap overflow-auto">
          <a href="#" class="tag" v-for="(tag, index) in filteredTags" :class="searchTags.findIndex(t => t.text == tag.text) > -1 ? 'selected':''" :key="index" @click.prevent="tagClick(tag)">{{ tag.text }}</a>
        </div>
      </div>
      <div v-if="addPassword" class="card p-4">
        <div>
          <label for="title">Title</label>
          <input id="title" ref="title" class="focus:outline-none" type="text" v-model="title" placeholder="Title" />
          <label for="username">Username</label>
          <input id="username" class="focus:outline-none" type="text" v-model="username" placeholder="Username" />
          <label for="password">Password</label>
          <input id="password" class="focus:outline-none" type="text" v-model="password" placeholder="Password" />
          <label for="tags">Tags</label>
          <vue-tags-input 
            id="tags"
            v-model="tag"
            :tags="tags"
            :autocomplete-items="filteredItems"
            @tags-changed="newTags => tags = newTags">
          </vue-tags-input>
        </div>
        <div class="mt-2">
          <button class="btn btn-sm btn-green" :disabled="!title || !username || !password" @click="addEntry">Save</button> 
          <button class="btn btn-sm ml-2" @click="addPassword=false">Cancel</button>
        </div>
      </div>
      <div class="card mt-4">
        <div class="px-4 py-2" v-if="filteredPasswords.length == 0">Hmm... nothing. <a href="#" @click.prevent="addPassword = true">Add a password?</a></div>
        <div class="password" v-for="(password, index) in paginate(filteredPasswords)" :key="index" :class="showIndex==index ? 'selected':''">
          <div class="px-4 py-2 cursor-pointer" @click="toggleDetails(index)">{{ password.title }}</div>
          <div class="shadow-inner bg-gray-100 px-4 py-2" v-if="showIndex==index">
            <div class="overflow-auto">
              <div class="whitespace-no-wrap">
                <span class="text-gray-600">Username:</span>
                <a class="ml-2" href="#" @click="copyToClipboard(password.username)">{{ password.username }} <i class="material-icons text-lg">file_copy</i></a>
              </div>
              <div class="mt-2 whitespace-no-wrap">
                <span class="text-gray-600">Password:</span>
                <a class="ml-2" href="#" @click="copyToClipboard(password.password)">{{ mask(password.password) }} <i aria class="material-icons text-lg">file_copy</i></a>
              </div>
              <div v-if="password.tags.length > 0" class="mt-2">
                <div class="text-gray-600 whitespace-no-wrap overflow-auto">Tags: <span class="text-gray-800">{{ password.tags.map(t => t.text).join(', ') }}</span></div>
              </div>
              <div class="mt-2 flex">
                <div class="w-1/2 text-left"><a href="#" @click.prevent="editEntry(index)"><i class="material-icons text-lg">edit</i>Edit</a></div>
                <div class="w-1/2 text-right"><a href="#" class="danger" @click.prevent="deleteEntry(index)"><i class="material-icons text-lg ml-2">delete</i>Delete</a></div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-gray-700 px-4 py-2">
          <div v-if="pages > 1" class="mb-2 whitespace-no-wrap overflow-auto">
            Page: 
            <span class="text-base">
              <a class="mr-2" href="#" @click.prevent="currentPage > 1 ? currentPage-- : false">&lt;</a>
              <a class="mr-2" href="#" v-for="page in pages" :key="page" :class="currentPage == page ? 'font-bold':''" @click.prevent="currentPage=page">{{ page }}</a>
              <a href="#" @click.prevent="currentPage < pages ? currentPage++ : false">&gt;</a>
            </span>
          </div>
          <div>
            Per Page: 
            <select class="bg-white border p-1 text-gray-700" v-model="perPage">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!notFound && !safe" class="card p-4">
      <form @submit.prevent>
        <div>
          <label for="passphrase">Enter a passphrase to decrypt safe</label>
          <input :class="error.passphrase ? 'border-red-500':''" class="focus:outline-none" v-model="passphrase" id="passphrase" type="password" placeholder="******************" autocomplete="new-password" />
          <p v-if="error.passphrase" class="text-red-500 text-xs italic">{{ error.passphrase }}</p>
        </div>
        <button :disabled="!passphrase || passphrase.length < 6" class="btn btn-green" @click="decryptSafe">Decrypt and open safe</button>
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
      showIndex: -1,
      editIndex: -1,
      searchText: '',
      searchTags: [],
      currentPage: 1,
      perPage: this.safe && this.safe.perPage ? this.safe.perPage : 10,
      notFound: false,
      addPassword: false,
      error: {}
    }
  },
  mounted: function() {
    this.uid = this.$route.params.uid
    this.fetchSafe()
  },
  watch: {
    addPassword: function(value) {
      if(value) {
        this.$nextTick(() => this.$refs.title.focus())
      } else {
        this.title = null
        this.username = null
        this.password = null
        this.tags = []
        this.editIndex = -1
        this.showIndex = -1
      }
    },
    perPage: function(perPage) {
      this.currentPage = 1
      if(this.safe) {
        this.safe.perPage = perPage
        this.saveSafe('Safe updated.')
      }
    }
  },
  computed: {
    pages: function() {
      return Math.ceil(this.filteredPasswords.length / this.perPage);
    },
    filteredPasswords: function() {
      let results = this.safe.passwords;
      if(this.searchText.length > 0) {
        results = this.safe.passwords.filter(password => 
          password.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
          password.username.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      this.searchTags.forEach(tag => {
        results = results.filter(r => r.tags.find(rt => rt.text == tag.text))
      })

      return results
    },
    filteredItems: function() {
      return this.allTags.filter(i => i.text.toLowerCase().includes(this.tag.toLowerCase()));
    },
    allTags: function() {
      let tags = []
      if(this.safe && this.safe.passwords) {
        this.safe.passwords.forEach(p => {
          p.tags.forEach(pt => {
            if(tags.findIndex(t => pt.text == t.text) == -1) {
              tags.push(pt);
            }
          })
        })
      }
      return tags.sort((a, b) => {
          if(a.text.toUpperCase() > b.text.toUpperCase()) {
              return 1;
          } else if(a.text.toUpperCase() < b.text.toUpperCase()) {
              return -1;
          }
          return 0;
      })
    },
    filteredTags: function() {
      let tags = []
      this.filteredPasswords.forEach(p => {
        p.tags.forEach(pt => {
          if(tags.findIndex(t => pt.text == t.text) == -1) {
            tags.push(pt);
          }
        })
      })
      return tags.sort((a, b) => {
          if(a.text.toUpperCase() > b.text.toUpperCase()) {
              return 1;
          } else if(a.text.toUpperCase() < b.text.toUpperCase()) {
              return -1;
          }
          return 0;
      })
    }
  },
  methods: {
    fetchSafe: function() {
      this.$http.get('/api/safe/' + this.uid)
      .then((response) => {
        this.$emit('log', response)
        this.encryptedSafe = response.data.safe
        this.$storage.setItem('uid', this.uid)
      })
      .catch((error) => {
        console.log(error.response)
        this.notFound = error.response
      })
    },
    decryptSafe: function() {
      try {
        let bytes = this.$crypto.AES.decrypt(this.encryptedSafe, this.passphrase)
        this.safe = JSON.parse(bytes.toString(this.$crypto.enc.Utf8))
        this.perPage = this.safe.perPage ? this.safe.perPage : 10
      }
      catch(err) {
        this.$emit('flash', { message: 'Problem decrypting safe. Wrong password?', success: false })
        this.passphrase = null
      }
    },
    saveSafe: function(message) {
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
    addEntry: function() {
      let entry = {
        title: this.title,
        username: this.username,
        password: this.password,
        tags: this.tags
      }
      if(this.editIndex > -1) {
        this.safe.passwords[this.editIndex] = entry
      } else {
        this.safe.passwords.push(entry)
      }
      this.safe.passwords.sort((a, b) => (a.title > b.title) ? 1 : -1)
      this.addPassword = false
      this.saveSafe('Safe updated')
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
        this.showIndex = -1
        this.saveSafe('Password deleted')
      }
    },
    editEntry: function(editIndex) {
      this.editIndex = editIndex
      this.title = this.safe.passwords[editIndex].title
      this.username = this.safe.passwords[editIndex].username
      this.password = this.safe.passwords[editIndex].password
      this.safe.passwords[editIndex].tags.forEach(tag => {
        this.tags.push(tag)
      })
      this.addPassword = true
    },
    mask: function(text) {
      let masked = ''
      for(var i=0; i<text.length; i++) {
        masked += '*'
      }
      return masked;
    },
    tagClick: function(tag) {
      if(this.searchTags.findIndex(t => t.text == tag.text) == -1) {
        this.searchTags.push(tag)
      } else {
        this.searchTags = this.searchTags.filter(t => t.text != tag.text)
      }
    },
    toggleDetails: function(index) {
      if(this.showIndex == index) {
        this.showIndex = -1
      } else {
        this.showIndex = index
      }
    },
    lockSafe: function() {
      this.safe = null
      this.passphrase = null
    },
    newSafe: function() {
      if(window.confirm('Are you sure you wish to close this safe and create a new one? Be sure you have saved your unique URL and/or seed words.')) {
        this.$router.push('/new')
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
    paginate: function(list) {
      return list.slice((this.currentPage * this.perPage) - this.perPage, (this.currentPage * this.perPage))
    }
  }
}
</script>
