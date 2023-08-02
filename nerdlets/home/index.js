import React from 'react';
import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Dropdown,
  DropdownItem,
  HeadingText,
  MultilineTextField,
  TextField,
  Spinner,
  NerdGraphQuery,
  Form,
  Button,
  Select,
  SelectItem,
  Icon,
  Tabs,
  Modal,
  TabsItem,
  AccountStorageMutation,
  AccountStorageQuery
} from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class NerdpackLayoutDoubleSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.toggleDetailPane = this.toggleDetailPane.bind(this);
    this.onCloseHandler = this.onCloseHandler.bind(this);
    this.collectionId = 'mycollection';
    this.documentId = 'learning-nerdstorage3';
    this._addToNerdStorage = this._addToNerdStorage.bind(this);
    this._removeFromNerdStorage = this._removeFromNerdStorage.bind(this);
    this._deleteDocument = this._deleteDocument.bind(this);
    

    this.state = {
      detailPanelActive: true,
      accountId: 1100964,
      accounts: null,
      selectedAccount: null,
      policies: null,
      selectedPolicy: null,
      detailPaneExpanded: true,
      isOpen: true,
      storage: [],
      text: '',
      TimeWindow: '',
      Target: '',
      Warning: '',
      Description: '',
    };
  }
 
  componentDidMount() {
    const accountId = this.state;
    console.log('TAccount ID:', accountId.accountId);
    const gql = `{ actor { accounts { id name } } }`;
    //const policyquery = `{ actor { account(id: 1100964) { alerts { policiesSearch { policies { id name } } } } } }`;
    //const policyquery2 = `{ actor { account(id: '+accountId+') { alerts { policiesSearch { policies { id name } } } } } }`;
    const policyquery = `{ actor { account(id: ${accountId.accountId}) { alerts { policiesSearch { policies { id name } } } } } }`;
    
    console.log('Policy Query:', policyquery);
    
    AccountStorageQuery.query({
      accountId: 1100964,
      collection: this.collectionId,
      documentId: this.documentId,
    }).then(({ data }) => 
     // console.log('NERDSTROAGE',data));
      this.setState({storage: data.storage}));

    


    const policies = NerdGraphQuery.query({query: policyquery}) //The NerdGraphQuery.query method called with the query object to get your account data is stored in the accounts variable.
    policies.then(results => {
        console.log('Policies Nerdgraph Response:', results);
        const policies = results.data.actor.account.alerts.policiesSearch.policies.map(policy => {
            return policy;
        });
        const policy = policies.length > 0 && policies[0];
        console.log('Policies Nerdgraph Policies:', policies);
        this.setState({ selectedPolicy: policy, policies });
    }).catch((error) => { console.log('Nerdgraph Error:', error); })

    const accounts = NerdGraphQuery.query({query: gql}) //The NerdGraphQuery.query method called with the query object to get your account data is stored in the accounts variable.
    accounts.then(results => {
        console.log('Nerdgraph Response:', results);
        const accounts = results.data.actor.accounts.map(account => {
            return account;
        });
        const account = accounts.length > 0 && accounts[0];
        this.setState({ selectedAccount: account, accounts });
        console.log('Policies Nerdgraph Accounts:', accounts);
    }).catch((error) => { console.log('Nerdgraph Error:', error); })
}
  /* Add componentDidMount here */
  _renderStorage(){
    const { storage } = this.state;
    console.log('render', storage)

    if(Array.isArray(storage) && storage.length == 0){
        return <div className="empty-message">You have no data stored in your NerdStorage profile. How do you suggest we solve this?</div>
    }

    return (
        <table className="nerdstorage-table">
            <thead>
                <tr>
                     
                </tr>
            </thead>
            <tbody>
                {storage.map((data, index) => (
                    <tr key={index}>
                        <td>{data}</td>
                        <td className="narrow-col">
                            <Button
                                onClick={() => this._removeFromNerdStorage(index, data)}
                                type={Button.TYPE.DESTRUCTIVE}
                                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

_renderSL(){
    const { storage } = this.state;
    console.log('render', storage)

    if(Array.isArray(storage) && storage.length == 0){
        return <div className="empty-message">You have no SLO set for your Alert Policies, Select "New SLO" on the right pane...  ?</div>
    }

    return (
      <table>
      <thead>
        <tr>
        <th>Policy Name</th>
        <th>SLO (1 Day)</th>
         <th>SLO (7 Days)</th>
         <th>SLO (28 Days)</th>    
         <th>1 Day Compliance</th>
         <th>7 Day Compliance</th>
         <th>28 Day Compliance</th>
         <th>1 Day Error Budget</th>
         <th>7 Day Error Budget</th>
         <th>28 Day Error Budget</th>
        </tr>
      </thead>
      <tbody>
      {storage.map((data, index) => (
                    <tr key={index}>
                        <td>{data}</td>
                        <td> 95% </td>
                        <td> 95% </td>
                        <td> 95% </td>
                        <td style={{backgroundColor: 'green'}}>{this.randomIntFromInterval()}%</td>
                        <td style={{backgroundColor: 'orange'}}>{this.randomIntFromInterval()}%</td>
                        <td style={{backgroundColor: 'green'}}>{this.randomIntFromInterval()}%</td>
                        <td style={{backgroundColor: 'green'}}>{this.randomIntFromInterval()}%</td>
                        <td style={{backgroundColor: 'red'}}>{this.randomIntFromInterval()}%</td>
                        <td style={{backgroundColor: 'green'}}>{this.randomIntFromInterval()}%</td>
                           
                        
                    </tr>
                    
                    
                ))} 
    
    </tbody>
    </table>
    )
}

randomIntFromInterval() { // min and max included 
  return Math.floor(Math.random() * (100 - 90 + 1) + 90)
}

getColor(number) {
	if (value >=90 && value <=95) {
		return 'green';
	} else if (value > 95 && value <=98) {
		return 'red';
	} else if (value > 98 && value <=100) {
		return 'orange';
	} else {
		return 'green';
	}
}

_addToNerdStorage(){
  const { text, storage } = this.state;
  storage.push(text);
  this.setState({storage}, () => {
    AccountStorageMutation.mutate({
          accountId: 1100964,
          actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
          collection: this.collectionId,
          documentId: this.documentId,
          document: { storage },
      })
      .then((res) => {
          this.setState({text: ''});
          Toast.showToast({ title: "NerdStorage Update.", type: Toast.TYPE.NORMAL });
      })
      .catch((err) => console.log(err));
  });
}


_removeFromNerdStorage(index, data){
  const { storage } = this.state;
  storage.pop(data);

  this.setState({storage}, () => {
    AccountStorageMutation.mutate({
          accountId: 1100964,
          actionType:AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
          collection: this.collectionId,
          documentId: this.documentId,
          document: { storage },
      })
      .then((res) => {
          Toast.showToast({ title: "NerdStorage Update.", type: Toast.TYPE.NORMAL });
      })
      .catch((err) => console.log(err));
  });
}

_deleteDocument(){
  this.setState({storage: []});
  AccountStorageMutation.mutate({
      accountId: 1100964,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: this.collectionId,
      documentId: this.documentId,
  });
  Toast.showToast({ title: "NerdStorage Update.", type: Toast.TYPE.CRITICAL });
}



  selectAccount(option) {
      

      const accountId = option.id;
      console.log('SETTTT TAccount ID:', accountId.accountId);
      
      const policyquery = `{ actor { account(id: ${accountId}) { alerts { policiesSearch { policies { id name } } } } } }`;
      
      console.log('SETTTTT Policy Query:', policyquery);
      
  
  
      const policies = NerdGraphQuery.query({query: policyquery}) //The NerdGraphQuery.query method called with the query object to get your account data is stored in the accounts variable.
      
      if (policies === undefined || policies === null) {





        
        console.log('✅ variable is undefined or null');
      } else {

        policies.then(results => {
          console.log('Policies Nerdgraph Response:', results);
          const policies = results.data.actor.account.alerts.policiesSearch.policies.map(policy => {
              return policy;
          });
          const policy = policies.length > 0 && policies[0];
          console.log('SETTTTT Policies Nerdgraph Policies:', policies);
          this.setState({ selectedPolicy: policy, policies });
      }).catch((error) => { console.log('Nerdgraph Error:', error); })
      
      this.setState({ accountId: option.id,selectedAccount: option });
      console.log('In Select Axccount');




        console.log('⛔️ variable is NOT undefined or null');
      }




      
  }

  selectPolicy(option) {
    this.setState({ policyId: option.id,selectedPolicy: option, text: option.name });
    console.log('SETTTTT SELECT Policies:', option.name);
   
    
}

selectTimeWindow(option) {
  //this.setState({TimeWindow: option });
  console.log('SET SELECT Time Window:', option.target.value);
 
  
}

  toggleDetailPane() {
    this.setState(prevState => ({
      detailPaneExpanded: !prevState.detailPaneExpanded
    }));
  }

  onCloseHandler() {
    this.setState({ detailPanelActive: false });
  }

  
  

  render() {
    const { detailPaneExpanded, detailPanelActive } = this.state;
    const { accountId, accounts, selectedAccount  } = this.state;
    const { policyId, policies, selectedPolicy } = this.state;
    const { storage } = this.state;
    console.log({accountId, accounts, selectedAccount});
    console.log({policyId, policies, selectedPolicy});

    const variables = {
      id: accountId,
      };
  
  const query = `
    query($id: Int!) {
        actor {
            account(id: $id) {
                name
            }
        }
    }
`;
    return (
      <>
        <Stack
          className="toolbar-container"
          fullWidth
          gapType={Stack.GAP_TYPE.NONE}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
          verticalType={Stack.VERTICAL_TYPE.FILL}
        >
          <StackItem className="toolbar-section1">
            <Stack
              gapType={Stack.GAP_TYPE.NONE}
              fullWidth
              verticalType={Stack.VERTICAL_TYPE.FILL}
            >
              {accounts &&
              <StackItem className="toolbar-item has-separator">

                    <TextField label="Search" placeholder="e.g. example query" />

             
              </StackItem>
  }
              <StackItem className="toolbar-item">
                
              </StackItem>
  
            </Stack>
          </StackItem>
          <StackItem className="toolbar-section2">
            <Stack
              fullWidth
              fullHeight
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
            >

            </Stack>
          </StackItem>
        </Stack>
        <Grid
          className={`primary-grid ${
            detailPaneExpanded
              ? 'detail-pane-grid-expanded'
              : 'detail-pane-grid-minimized'
          }`}
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
      
          <GridItem className="primary-content-container" columnSpan={detailPaneExpanded && detailPanelActive ? 9 : 12}>
                                 {true &&
                                    this._renderSL()
                                }
          </GridItem>
          
          <GridItem
            className="detail-pane-grid-item "
            columnSpan={detailPaneExpanded && detailPanelActive ? 3 : 0}
          >
           <div className={`container-panel ${this.props.className}`}>
        <div className="header">
           <h3>Service Levels</h3>
          <span
            className="minimize-button"
            onClick={() => this.props.toggleDetailPane()}
          >
            <Icon
              type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
              color="#000E0E"
             // sizeType={Icon.SIZE_TYPE.SMALL}
            />
          </span>
        </div>
        <Tabs>
          <TabsItem value="SLOdetail" label="SLO">
          <Form layoutType={Form.LAYOUT_TYPE.SPLIT}>
         
         <StackItem className="SLOItem">
         
         <TextField  label="Account" />

         <TextField  label="Policy" />

        

         
        
            
            <TextField placeholder="95" label="Target (%)" />
                           <TextField placeholder="95" label="Warning (%)" />
         
       
         <MultilineTextField
           label="Description"
           info="Info tooltip"
           placeholder="Placeholder text"
         />
       
       <Button
    onClick={() => this._addToNerdStorage()}
    type={Button.TYPE.PRIMARY}
    sizeType={Button.SIZE_TYPE.SMALL}
    spacingType={[
      HeadingText.SPACING_TYPE.EXTRA_LARGE,
      HeadingText.SPACING_TYPE.NONE,
    ]}
  >
    Update Target  
  </Button>
       
       
         </StackItem>
       </Form>;
          </TabsItem>
           <TabsItem value="tab2" label="New SLO">
          <Form layoutType={Form.LAYOUT_TYPE.SPLIT}>
         
  <StackItem className="NewSLOItem">
  
  {accounts &&
  
                  <Select label="Account" title="Choose an option" value={selectedAccount} onChange={(evt, value) => this.selectAccount(value)}>
                        {accounts.map(a => {
                            return (
                              <SelectItem key={a.id} value={a}>
                                {a.name}
                              </SelectItem>
                            )
                        })}
                    </Select>

  }
  
  {policies &&
             

                  <Select label="Policy" title="Choose an option" value={selectedPolicy} onChange={(evt, value) => this.selectPolicy(value)}>
                
                        {policies.map(a => {
                            return (
                              <SelectItem key={a.id} value={a}>
                                {a.name}
                              </SelectItem>
                            )
                        })}
                    </Select>

             
           
  }
      
     
     <TextField placeholder="95" label="Target (%)" />
                    <TextField placeholder="95" label="Warning (%)" />
  

  <MultilineTextField
    label="Description"
    info="Info tooltip"
    placeholder="Placeholder text"
  />



  <Button
    onClick={() => this._addToNerdStorage()}
    type={Button.TYPE.PRIMARY}
    sizeType={Button.SIZE_TYPE.SMALL}
    spacingType={[
      HeadingText.SPACING_TYPE.EXTRA_LARGE,
      HeadingText.SPACING_TYPE.NONE,
    ]}
  >
    Add a New Target  
  </Button>

  </StackItem>
</Form>;

          </TabsItem>
          <TabsItem value="tab3" label="Delete SLO">
          <Form layoutType={Form.LAYOUT_TYPE.SPLIT}>
         
  <StackItem className="DeleteSLOItem">
  
  {true &&
                                    this._renderStorage()
                                }
 

  </StackItem>
</Form>;

          </TabsItem>

        </Tabs>
      </div>
  
          </GridItem>
         
        </Grid>
      </>
    );
  }
}
