import React, { Component } from 'react'
import { Grid, Header, Form, Segment, Message, Icon, Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from '../../firebase'
import md5 from 'md5'

class Register extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            errors: [],
            loading: false,
            usersRef: firebase.database().ref('users')
        }
    }




    isFormValid = () => {
        let errors = [];
        let error;
        this.setState({ errors: [] })
        if (this.isFormEmpty(this.state)) {
            //throw error
            error = { message: 'Fill in all the fields' }
            this.setState({ errors: errors.concat(error) })
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            //throw error
            error = { message: 'Password is invalid' }
            this.setState({ errors: errors.concat(error) })
            return false;
        }
        else {
            // this.setState({errors:[]})
            return true;
        }
    }

    isFormEmpty = ({ username, email, password,
        passwordConfirmation }) => {

        return !username.length || !email.length
            || !password.length || !passwordConfirmation.length

    }

    isPasswordValid = ({ password, passwordConfirmation }) => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            console.log('password length')
            return false
        }
        else if (password !== passwordConfirmation) {
            console.log('password confirm check')

            return false
        }
        else {
            return true
        }
    }


    displayErrors = errors => errors.map((error, i) =>
        <p key={i}>
            Error: {error.message}
        </p>)


    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault()

        if (this.isFormValid()) {
            this.setState({ error: [], loading: true })
            firebase.auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    console.log(createdUser)
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${
                            md5(createdUser.user.email)}?d=identicon`
                            }).then(() => {
                                this.saveUser(createdUser).then(() => {
                                console.log('user saved')
                                    })
                    }).catch(error => {
                        console.log(error)
                        this.setState({
                            errors: this.state.errors.concat(error),
                            loading: false
                        })
                    })
                    // this.setState({ errors: [], loading: false })
                })
                .catch(error => {
                    console.log(error)
                    this.setState({
                        errors: this.state.errors.concat(error),
                        loading: false
                    })
                })
        }
    }

    handleInputError = (errors, inputName) => {
        // console.table(errors,inputName)
        return errors.some(
            error =>
                error.message.toLowerCase().includes(inputName))
            ?
            'error' : ''
    }


    saveUser = (createdUser) => {
        return this.state.usersRef
            .child(createdUser.user.uid)
            .set({
                name: createdUser.user.displayName,
                avatar: createdUser.user.photoURL
            })
    }

    render() {

        const { username,
            email,
            password,
            passwordConfirmation,
            errors,
            loading
        } = this.state


        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h2" icon color="orange" textAlign="center">
                            <Icon name="puzzle piece" color="orange" />
                            Register to Helloskills messenger
                        </Header>

                        {errors.length > 0 &&
                            (<Message error size="small">

                                {this.displayErrors(errors)}
                            </Message>
                            )}

                        <Form size="large" onSubmit={this.handleSubmit}>
                            <Segment stacked>

                                <Form.Input fluid name="username" icon="user"
                                    iconPosition="left" placeholder="Username"
                                    onChange={this.handleChange}
                                    value={username} type="text"
                                />

                                <Form.Input fluid name="email" icon="mail"
                                    iconPosition="left" placeholder="Email Address"
                                    onChange={this.handleChange}
                                    value={email} type="text"
                                    className={this.handleInputError(errors, 'email')} />

                                <Form.Input fluid name="password" icon="lock"
                                    iconPosition="left" placeholder="Password"
                                    onChange={this.handleChange}
                                    value={password} type="password"
                                    className={this.handleInputError(errors, 'password')} />

                                <Form.Input fluid name="passwordConfirmation" icon="lock"
                                    iconPosition="left" placeholder="Confirm Password"
                                    onChange={this.handleChange}
                                    value={passwordConfirmation} type="password"
                                    className={this.handleInputError(errors, 'password')} />

                                <Button disabled={loading}
                                    className={loading ? 'loading' : ''}
                                    color="orange" fluid size="large">Submit</Button>
                            </Segment>
                        </Form>



                        <Message> Already a user? <Link to="/login">Login</Link></Message>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
}

export default Register
