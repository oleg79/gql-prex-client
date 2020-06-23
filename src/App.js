import React from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Chip from '@material-ui/core/Chip';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FaceIcon from '@material-ui/icons/Face';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import SchoolIcon from '@material-ui/icons/School';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {gql} from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import orange from "@material-ui/core/colors/orange";


const Result = ({query}) => {
  const { loading, error, data } = useQuery(gql(query));
  console.log(loading, error, data)
  return null;
};

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  }
});

const StyledContainer = styled(Container)`
  flex-grow: 1;
`;

const QueryInput = styled(Paper)`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 0;
  padding: 5px;
`;

const getIcon = (type) => ({
  schools: <SchoolIcon style={{ color: orange[400] }}/>,
  groups: <PeopleOutlineIcon style={{ color: orange[400] }}/>,
  teachers: <FaceIcon style={{ color: orange[400] }}/>,
  students: <ChildCareIcon style={{ color: orange[400] }}/>,
})[type];

const schoolFields = ['id', 'name'];
const groupFields = ['id', 'name'];
const teacherFields = ['id', 'firstName', 'lastName', 'username']
const studentFields = ['id', 'firstName', 'lastName', 'username']

const schoolFilters = ['id', 'name'];
const groupFilters = ['id', 'name'];
const teacherFilters = ['id', 'firstName', 'lastName', 'username']
const studentFilters = ['id', 'firstName', 'lastName', 'username']

const getFields = (type) => ({
  schools: schoolFields,
  groups: groupFields,
  teachers: teacherFields,
  students: studentFields,
})[type];

const getFilters = (type) => ({
  schools: schoolFilters,
  groups: groupFilters,
  teachers: teacherFilters,
  students: studentFilters,
})[type];


const sanitizeType = (previous, current) => ({
  students: {
    schools: 'school'
  },
  groups: {
    schools: 'school'
  }
})[previous]?.[current] ?? current;


function buildQuery (querySet, fields, filters) {
  return querySet.reduce((q, chunk) => {
    const {id, type} = chunk;
    const sanitizedType = sanitizeType(buildQuery.previousType, type);
    const f = [...fields.get(id).filter(([_, v]) => v).map(([v]) => v), '_PL_'];

    buildQuery.previousType = type;
    return q.replace('_PL_', `${sanitizedType} {${f.join(' ')}}`)
  }, '{_PL_}').replace('_PL_', '');
}

const App = () => {

  const [query, setQuery] = React.useState(null);
  const [querySet, setQuerySet] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedQueryItem, setSelectedQueryItem] = React.useState(null);
  const [fields, setFields] = React.useState(new Map());
  const [filters, setFilters] = React.useState(new Map());

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addQuery = (type) => () => {
    const id = uuidv4();
    setQuerySet(querySet => [...querySet, {type, id}]);

    setFields(fs => fs.set(id, getFields(type).map(f => [f, true])))
    setFilters(fs => fs.set(id, getFilters(type).map(f => [f, ''])))

    handleClose();
  };

  const deleteQueryItem = (id) => () => {
    setQuerySet(querySet => querySet.filter(q => q.id !== id));
  };

  const toggleField = (id, text) => () => {
    const newFields = fields.get(id).map(([t, v]) => text === t ? [t, !v] : [t, v]);
    fields.set(id, newFields);

    setFields(new Map(fields));
  };

  const handleFilter = (id, text) => (event) => {
    const newFilters = filters.get(id).map(([t, v]) => text === t ? [t, event.target.value] : [t, v]);
    filters.set(id, newFilters);

    setFilters(new Map(filters));
  };

  const performQuery = () => {
    const q = buildQuery(querySet, fields)

    setQuery(q);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <StyledContainer fixed>
        <AppBar position='static'>
          <Toolbar variant='dense'>
            <Typography variant='h6' color='inherit'>GLUi - GLU cool'n'ugly lil' GraphQL Brother 👶</Typography>
          </Toolbar>
        </AppBar>
        <QueryInput>
          {querySet.map(({type, id}, index) => (
            <React.Fragment key={id}>
              <Chip
                variant='outlined'
                avatar={getIcon(type)}
                onDelete={deleteQueryItem(id)}
                onClick={
                  selectedQueryItem === id
                    ? () => setSelectedQueryItem(null)
                    : () => setSelectedQueryItem(id)
                }
                clickable
              />
              {querySet.length > 1 && index !== querySet.length - 1 && <ChevronRightIcon/>}
              {index === querySet.length - 1 ? <span>&nbsp;</span> : null}
            </React.Fragment>
          ))}
          <Button variant='contained' color='primary' onClick={handleClick}>
            <AddIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            { querySet[querySet.length - 1]?.type !== 'schools' &&
              <MenuItem onClick={addQuery('schools')}>
                <ListItemIcon>
                  <SchoolIcon/>
                </ListItemIcon>
                <ListItemText>
                  Schools
                </ListItemText>
              </MenuItem>
            }

            { querySet[querySet.length - 1]?.type !== 'groups' &&
              <MenuItem onClick={addQuery('groups')}>
                <ListItemIcon>
                  <PeopleOutlineIcon/>
                </ListItemIcon>
                <ListItemText>
                  Groups
                </ListItemText>
              </MenuItem>
            }

            { querySet[querySet.length - 1]?.type !== 'teachers' &&
              <MenuItem onClick={addQuery('teachers')}>
                <ListItemIcon>
                  <FaceIcon/>
                </ListItemIcon>
                <ListItemText>
                  Teachers
                </ListItemText>
              </MenuItem>
            }

            { querySet[querySet.length - 1]?.type !== 'students' &&
              <MenuItem onClick={addQuery('students')}>
                <ListItemIcon>
                  <ChildCareIcon/>
                </ListItemIcon>
                <ListItemText>
                  Students
                </ListItemText>
              </MenuItem>
            }

          </Menu>
        </QueryInput>
        { selectedQueryItem &&
          <Paper elevation={2}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={6}>
                <List
                  subheader={
                    <ListSubheader component="div" id="fields-subheader">
                      Fields
                    </ListSubheader>
                  }
                  dense
                  component="div"
                  role="list"
                >
                  {fields.get(selectedQueryItem).map(([text, value]) => {
                    const labelId = `fields-item-${text}-label`;

                    return (
                      <ListItem key={text} role="listitem" button onClick={toggleField(selectedQueryItem, text)}>
                        <ListItemIcon>
                          <Checkbox
                            checked={value}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={text} />
                      </ListItem>
                    );
                  })}
                  <ListItem />
                </List>
              </Grid>

              <Grid item xs={6} sm={6}>
                <List
                  subheader={
                    <ListSubheader component="div" id="filters-subheader">
                      Filters
                    </ListSubheader>
                  }
                  dense
                  component="div"
                  role="list"
                >
                  {filters.get(selectedQueryItem).map(([text, value]) => {

                    return (
                      <ListItem key={text} role="listitem">
                        <TextField
                          id="standard-basic"
                          label={text}
                          value={value}
                          color='secondary'
                          onChange={handleFilter(selectedQueryItem, text)}
                        />
                      </ListItem>
                    );
                  })}
                  <ListItem />
                </List>
              </Grid>
              <Button
                onClick={() => setSelectedQueryItem(null)}
                color='secondary'
                fullWidth
              >Done</Button>
            </Grid>
          </Paper>
        }
        <Button onClick={performQuery}>CHECK</Button>
        {query && <Result query={query}/>}
      </StyledContainer>
    </ThemeProvider>
  );
}

export default App;
