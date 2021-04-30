// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import { Container } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import fetch from 'cross-fetch';
import React from 'react';
import ReactMarkdown from 'react-markdown';


// This interface is a simple DTO which I use for conveniency 
// during working with data returned from Guthub. Not all the 
// fields instantiated here for the sake of simplicity
interface Issue {
  id: number,
  title: string,
  html_url: string,
  body: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {

      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
);

// main component used for retrieving data from GitHub and 
// display it with Material's UI Autocomplete function.
// When returns, it provided inforamation about all issues
// as well as part of the DOM responsible for display layout
export default function Asynchronous() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Issue[]>([]);
  const [selectedValue, selectValue] = React.useState<Issue | null>();
  const loading = open && options.length === 0;

  const classes = useStyles();

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      const response = await fetch('https://api.github.com/repos/facebook/react/issues');
      const countries = await response.json();

      if (active) {
        setOptions(Object.keys(countries).map((key) => countries[key]) as Issue[]);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);


  // Simple Grid layout with input at the left
  // and content at right. It allows me to use standard Material-UI
  // Autocomplete, preloading data on state change and then render 
  // it using Markdown editor to show it properly on right side
  let content = (<div className={classes.root}>
    <Container maxWidth="lg">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={3}
      >
        <Grid item xs={3}>
          <Autocomplete
            id="issue-searcher"
            style={{ width: 300 }}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            onChange={(ev, val) => selectValue(val)}
            getOptionSelected={(option, value) => option.title === value.title}
            getOptionLabel={(option) => option.title}
            options={options}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Issue Title"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid container item xs>
          {selectedValue != null &&
            <Grid
              container item xs
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
            >
              <Typography variant="h4">
                {selectedValue.title}
              </Typography>
              <Typography variant="subtitle1">
                <a href={selectedValue.html_url}>{selectedValue.html_url}</a>
              </Typography>
              <ReactMarkdown
                children={selectedValue.body}
              />
            </Grid>
          }
        </Grid>
      </Grid>
    </Container>
  </div >
  );

  return <div>{content}</div>;
}
