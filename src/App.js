import React, { Component } from 'react';
import './App.css';
import { umf } from './Artist';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedBlocks: {
				29: [],
				30: [],
				31: []
			},
			selectedEvents: {
				29: [],
				30: [],
				31: []
			},
			day: 29,
			saved: false
		};
	}

	componentDidMount() {
		const savedArtist = localStorage.getItem('umf-jmager');
		if (!!savedArtist) {
			let parsedArtist = JSON.parse(savedArtist);
			this.setState({
				selectedBlocks: parsedArtist.selectedBlocks,
				selectedEvents: parsedArtist.selectedEvents
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedEvents[this.state.day] !== this.state.selectedEvents[this.state.day]) {
			let selectedBlocks = [];
			this.state.selectedEvents[this.state.day].forEach(event => selectedBlocks.push(event.blocks));
			this.setState({
				selectedBlocks: { ...this.state.selectedBlocks, [this.state.day]: selectedBlocks.flat() }
			});
		}
	}

	checkBlocks = eventBlocks => {
		const { selectedBlocks } = this.state;

		let filteredBlocks = selectedBlocks[this.state.day].filter(block =>
			eventBlocks.includes(block)
		);

		if (filteredBlocks.length > eventBlocks.length) return true;
		return false;
	};

	selectEvent = event => {
		if (
			this.state.selectedEvents[this.state.day].filter(e => e.artist.id === event.artist.id)
				.length > 0
		)
			this.setState({
				selectedEvents: {
					...this.state.selectedEvents,
					[this.state.day]: this.state.selectedEvents[this.state.day].filter(
						e => e.artist.id !== event.artist.id
					)
				}
			});
		else
			this.setState({
				selectedEvents: {
					...this.state.selectedEvents,
					[this.state.day]: [...this.state.selectedEvents[this.state.day], event]
				}
			});
	};

	createRow = stage => {
		const { day } = this.state;
		let row = [];
		let end = new Date(2019, 2, day + 1, 2);
		let current = new Date(2019, 2, day, 14);

		let currentArtist = {};
		let currentArtistBlocks = [];
		let currentBlock = 0;
		let added = false;

		while (current <= end) {
			let nowPlaying = umf.artist.filter(artist => {
				let _start = new Date(artist.startTime);
				let _end = new Date(artist.endTime);

				let dayCheck = false;
				if (
					(_end.getHours() > 4 && _end.getDate()) === day ||
					(_end.getHours() < 4 && _end.getDate() === (day + 1 < 32 ? day + 1 : 1))
				)
					dayCheck = true;

				return dayCheck && artist.stage === stage && (current <= _end && current >= _start);
			})[0];

			if (!!nowPlaying) {
				if (currentArtist.id !== nowPlaying.id) {
					row.push({ artist: currentArtist, blocks: currentArtistBlocks });
					added = true;

					currentArtist = nowPlaying;
					currentArtistBlocks = [];
				}

				added = false;
				currentArtistBlocks.push(currentBlock);
			} else {
				if (!added) {
					row.push({ artist: currentArtist, blocks: currentArtistBlocks });

					currentArtist = {};
					currentArtistBlocks = [];
					added = true;
				}
				row.push({ empty: true });
			}

			currentBlock++;
			current.setSeconds(current.getSeconds() + 430);
		}

		row.push({ artist: currentArtist, blocks: currentArtistBlocks });

		return row.map((item, i) => {
			if (!!item.empty)
				return (
					<div key={i} style={{ width: `1%` }}>
						&nbsp;
					</div>
				);
			else if (!!item.artist.id)
				return (
					<div
						key={i}
						style={{
							width: `${item.blocks.length}%`
						}}
						className={`event ${
							this.state.selectedEvents[this.state.day].filter(event => {
								return event.artist.id === item.artist.id;
							}).length > 0
								? this.checkBlocks(item.blocks)
									? 'selectedConflict'
									: 'selected'
								: ''
						}`}
						onClick={() => this.selectEvent(item)}
					>
						{item.artist.name}
					</div>
				);
		});
	};

	renderTimes = () => {
		let row = [];
		for (let i = 0; i < 73; i++) {
			if (!(i % 6))
				row.push(
					<div key={i} style={{ width: '2%' }}>
						{i / 6 + 2 < 13 ? i / 6 + 2 + 'pm' : i / 6 + 2 - 12 + 'am'}
					</div>
				);
			else
				row.push(
					<div key={i} style={{ width: '2%' }}>
						&nbsp;
					</div>
				);
		}
		return row;
	};

	save = () => {
		const { selectedBlocks, selectedEvents } = this.state;
		localStorage.setItem(
			'umf-jmager',
			JSON.stringify({
				selectedBlocks,
				selectedEvents
			})
		);

		this.setState({ saved: true });
		setTimeout(() => this.setState({ saved: false }), 1000);
	};

	render() {
		const { day, saved } = this.state;

		return (
			<div className="app">
				<div id="background" />
				<div className="title">
					<h2>UMF 2019</h2>
					<p>Select each artist you want to attend, any conflicting times will be in red.</p>
					<hr />
					<div className="dayButtons">
						<button
							className={`${day === 29 ? 'active' : ''}`}
							onClick={() => this.setState({ day: 29 })}
						>
							Friday
						</button>
						<button
							className={`${day === 30 ? 'active' : ''}`}
							onClick={() => this.setState({ day: 30 })}
						>
							Saturday
						</button>
						<button
							className={`${day === 31 ? 'active' : ''}`}
							onClick={() => this.setState({ day: 31 })}
						>
							Sunday
						</button>
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						marginTop: 25,
						marginLeft: '10%'
					}}
				>
					{this.renderTimes()}
				</div>
				<div className="eventsRowWrapper">
					<div className="title">Ultra Main Stage</div>
					<div style={{ width: '90%', display: 'flex' }}>{this.createRow('Ultra Main Stage')}</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">{this.state.day === 31 ? 'State of Trance' : 'Live Arena'}</div>
					<div style={{ width: '90%', display: 'flex' }}>{this.createRow('Live Arena')}</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">Ultra Worldwide</div>
					<div style={{ width: '90%', display: 'flex' }}>{this.createRow('Ultra Worldwide')}</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">UMF Radio</div>
					<div style={{ width: '90%', display: 'flex' }}>{this.createRow('UMF Radio')}</div>
				</div>
				<div className="eventsRowWrapper" style={{ marginTop: 35 }}>
					<div className="title">Resistance Carl Cox</div>
					<div style={{ width: '90%', display: 'flex' }}>
						{this.createRow('Resistance Carl Cox')}
					</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">Resistance Reflector</div>
					<div style={{ width: '90%', display: 'flex' }}>
						{this.createRow('Resistance Reflector')}
					</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">Resistance Arrival</div>
					<div style={{ width: '90%', display: 'flex' }}>
						{this.createRow('Resistance Arrival')}
					</div>
				</div>
				<div className="eventsRowWrapper">
					<div className="title">Oasis</div>
					<div style={{ width: '90%', display: 'flex' }}>{this.createRow('Oasis')}</div>
				</div>
				<div className="info">
					<p className={`savedText ${saved ? 'visible' : ''}`}>Saved locally!</p>
					<div>
						<button onClick={this.save}>Save</button>
						<button
							onClick={() =>
								this.setState({
									selectedBlocks: {
										29: [],
										30: [],
										31: []
									},
									selectedEvents: {
										29: [],
										30: [],
										31: []
									}
								})
							}
						>
							Clear All
						</button>
					</div>
					<p>Total Sets: {umf.artist.length}</p>
					<p>
						Any mistakes email me <a href="mailto:jmager@mtu.edu">jmager@mtu.edu</a>
					</p>
					<p>
						Buy me a beer on venmo <span>@jmager</span>
					</p>
				</div>
			</div>
		);
	}
}

export default App;
