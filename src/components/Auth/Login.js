import React, { Component } from 'react'
import { Grid, Header, Form, Segment, Message, Icon, Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from '../../firebase'

class Login extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            password: '',
            errors: [],
            loading: false,
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
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true })
           
            firebase.auth()
            .signInWithEmailAndPassword(this.state.email,this.state.password)
            .then(signedInUser=>
                console.log(signedInUser))
            .catch(error=>{
                console.log(error)
                this.setState({
                    errors: this.state.errors.concat(error),
                    loading:false
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

    isFormValid=({email,password})=> email && password
    

    render() {

        const { username,
            email,
            password,
            errors,
            loading
        } = this.state


        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h2" icon color="violet" textAlign="center">
                            <Icon name="puzzle piece" color="violet" />
                            Login to DevChat
                        </Header>

                        {errors.length > 0 &&
                            (<Message error size="small">

                                {this.displayErrors(errors)}
                            </Message>
                            )}

                        <Form size="large" onSubmit={this.handleSubmit}>
                            <Segment stacked>

                               

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

                                
                                <Button disabled={loading}
                                    className={loading ? 'loading' : ''}
                                    color="violet" fluid size="large">Submit</Button>
                            </Segment>
                        </Form>



                        <Message> Don't have an account? <Link to="/register">Register</Link></Message>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
}

export default Login
