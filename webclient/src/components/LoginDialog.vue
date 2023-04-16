<template>
    <div uk-modal="bg-close: false; esc-close: false;">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">Login</h2>
            </div>
            <div class="uk-modal-body">
                <form class="uk-form-stacked">

                    <div class="uk-margin">
                        <label class="uk-form-label" for="txtUsername">Username</label>
                        <div class="uk-form-controls">
                            <input class="uk-input" ref="username" id="txtUsername" type="email" 
                                placeholder="Username/Email" 
                                @input="onValueChanged"
                                @keypress.enter="doLogin">
                        </div>
                    </div>
                    
                    <div class="uk-margin">
                        <label class="uk-form-label" for="txtPassword">Password</label>
                        <div class="uk-form-controls">
                            <input class="uk-input" ref="password" id="txtPassword" type="password" 
                                placeholder="Password" 
                                @input="onValueChanged"
                                @keypress.enter="doLogin">
                        </div>
                    </div>

                </form>
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button ref="btnLogin" class="uk-button uk-button-primary" type="button" @click="doLogin" disabled>Login</button>
            </div>
        </div>
    </div>
</template>

<script>
import UIkit from 'uikit';
import Firebase from '../data/firebase';

export default {
    methods: {
        async doLogin() {
            if (this.$refs.btnLogin.disabled === false) {
                try {
                    await Firebase.signInWithEmailAndPassword(this.$refs.username.value, this.$refs.password.value);
                } catch (err) {
                    console.log(err.code);
                    switch (err.code) {
                        case 'auth/user-disabled':
                            UIkit.notification('Your account has been disabled', { status: 'warning' });
                            break;
                        case 'auth/too-many-requests':
                            UIkit.notification('Too many login requests, try again later', { status: 'warning' });
                            break;
                        default:
                            UIkit.notification('Invalid username or password', { status: 'danger' });
                            break;
                    }
                }
            }
        },
        onValueChanged() {
            this.$refs.btnLogin.disabled = (this.$refs.username.value.length == 0) || (this.$refs.password.value.length == 0);
        },
        authStateChanged(auth) {
            if (auth) {
                UIkit.modal(this.$el).hide();
                // make sure the username and password can't be grabbed from the DOM
                this.$refs.username.value = '';
                this.$refs.password.value = '';
                this.$refs.btnLogin.disabled = true;
            } else {
                this.$refs.username.value = '';
                this.$refs.password.value = '';
                this.$refs.btnLogin.disabled = true;
                UIkit.modal(this.$el).show();
            }
        }
    },
    mounted() {
        Firebase.on('authStateChanged', this.authStateChanged);
    }
}
</script>