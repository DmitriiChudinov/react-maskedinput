'use strict';

var React = require('react')
var {getSelection, setSelection} = require('react/lib/ReactInputSelection')

var MaskedInput = React.createClass({
  propTypes: {
    pattern: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      value: ''
    }
  },

  componentWillMount() {
    this.mask = new InputMask({
      pattern: this.props.pattern,
      value: this.props.value
    })
  },

  _updateMaskSelection() {
    this.mask.selection = getSelection(this.getDOMNode())
  },

  _updateInputSelection() {
    setSelection(this.getDOMNode(), this.mask.selection)
  },

  _onChange(e) {
    console.log('onChange', getSelection(this.getDOMNode()), e.target.value)

    var maskValue = this.mask.getValue()
    if (e.target.value != maskValue) {
      // Cut or delete operations will have shortened the value
      if (e.target.value.length < maskValue.length) {
        var sizeDiff = maskValue.length - e.target.value.length
        this._updateMaskSelection()
        this.mask.selection.end = this.mask.selection.start + sizeDiff
        this.mask.backspace()
      }
      e.target.value = this.mask.getValue()
      this._updateInputSelection()
    }
    if (this.props.onChange) {
      this.props.onChange(e)
    }
  },

  _onKeyDown(e) {
    console.log('onKeyDown', getSelection(this.getDOMNode()), e.key, e.target.value)

    if (e.key == 'Backspace') {
      e.preventDefault()
      this._updateMaskSelection()
      if (this.mask.backspace()) {
        e.target.value = this.mask.getValue()
        this._updateInputSelection()
        this.props.onChange(e)
      }
    }
  },

  _onKeyPress(e) {
    console.log('onKeyPress', getSelection(this.getDOMNode()), e.key, e.target.value)

    // Ignore modified key presses
    if (e.metaKey || e.altKey || e.ctrlKey) { return }

    e.preventDefault()
    this._updateMaskSelection()
    if (this.mask.input(e.key)) {
      e.target.value = this.mask.getValue()
      this._updateInputSelection()
      this.props.onChange(e)
    }
  },

  _onPaste(e) {
    console.log('onPaste', getSelection(this.getDOMNode()), e.clipboardData.getData('Text'), e.target.value)

    e.preventDefault()
    this._updateMaskSelection()
    // getData value needed for IE also works in FF & Chrome
    if (this.mask.paste(e.clipboardData.getData('Text'))) {
      e.target.value = this.mask.getValue()
      // Timeout needed for IE
      setTimeout(this._updateInputSelection, 0)
      this.props.onChange(e)
    }
  },

  render() {
    var {pattern, ...props} = this.props
    return <input {...props}
      maxLength={pattern.length}
      onChange={this._onChange}
      onKeyDown={this._onKeyDown}
      onKeyPress={this._onKeyPress}
      onPaste={this._onPaste}
      size={pattern.length}
      value={this.mask.getValue()}
    />
  }
})

module.exports = MaskedInput