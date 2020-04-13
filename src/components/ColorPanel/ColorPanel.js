import React, { Component } from 'react'
import { Sidebar, Menu, Divider, Button, Modal, ModalActions, Label, Icon } from 'semantic-ui-react'
import {SliderPicker} from 'react-color'

class ColorPanel extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modal: false
        }
    }

    openModal = () => this.setState({ modal: true })
    closeModal = () => this.setState({ modal: false })
    render() {
        const { modal } = this.state
        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin">
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header> Choose App colors</Modal.Header>
                    <Modal.Content>
                        <Label content="Primary Color"/>
                        <SliderPicker/>
                        <Label content="Secondary Color"/>
                        <SliderPicker/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green">
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button color="red">
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}

export default ColorPanel
