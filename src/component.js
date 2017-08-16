var React = global.React || require('react');
var PropTypes = require('prop-types')
var objectAssign = require('object-assign');

class Resizable extends React.components {
  constructor(props) {
    super(props)
    this.lastDimensions = {
      width: null,
      height: null
    }
  }

  requestFrame(fn) {
    return (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); })(fn);
  }

  cancelFrame(id) {
    return (window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout)(id);
  }

  componentDidMount() {
    this.resetTriggers();
    this.initialResetTriggersTimeout = setTimeout(this.resetTriggers, 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.initialResetTriggersTimeout);
  }

  componentDidUpdate() {
    this.resetTriggers();
  }

  resetTriggers() {
    var contract = this.refs.contract;
    var expandChild = this.refs.expandChild;
    var expand = this.refs.expand;

    contract.scrollLeft = contract.scrollWidth;
    contract.scrollTop = contract.scrollHeight;
    expandChild.style.width = expand.offsetWidth + 1 + 'px';
    expandChild.style.height = expand.offsetHeight + 1 + 'px';
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
  }

  onScroll() {
    if (this.r) this.cancelFrame(this.r);
    this.r = this.requestFrame(function() {
      var dimensions = this.getDimensions();

      if (this.haveDimensionsChanged(dimensions)) {
        this.lastDimensions = dimensions;
        this.props.onResize(dimensions);
      }
    }.bind(this));
  }

  getDimensions() {
    var el = this.refs.resizable;
    return {
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  }

  haveDimensionsChanged(dimensions) {
    return dimensions.width != this.lastDimensions.width || dimensions.height != this.lastDimensions.height;
  }

  render() {
    const { triggersClass, expandClass, contractClass, embedCss, onResize, ...rest } = this.props;
    var props = objectAssign({}, rest, { onScroll: this.onScroll, ref: 'resizable' });
    return (
      React.createElement('div', props, [
        this.props.children,
        React.createElement('div', { className: triggersClass, key: 'trigger' }, [
          React.createElement('div', { className: expandClass, ref: 'expand', key: 'expand' }, React.createElement('div', { ref: 'expandChild' })),
          React.createElement('div', { className: contractClass, ref: 'contract', key: 'contract' })
        ]),
        embedCss ? React.createElement('style', { key: 'embededCss', dangerouslySetInnerHTML: { __html: '.resize-triggers { visibility: hidden; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }' } }) : null
      ])
    );
  }

}

Resizeable.propTypes = {
  triggersClass: PropTypes.string,
  expandClass: PropTypes.string,
  contractClass: PropTypes.string,
  embedCss: PropTypes.bool,
  onResize: PropTypes.func.isRequired
}

Resizable.defaultProps = {
  triggersClass: 'resize-triggers',
  expandClass: 'expand-trigger',
  contractClass: 'contract-trigger',
  embedCss: true
}

module.exports = Resizable;
global.Resizable = Resizable;